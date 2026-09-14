from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import os
import uuid
import hashlib

from database import get_db
from models_db import gen_id

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class UserRegister(BaseModel):
    Username: str
    full_name: str
    password: str
    role: str = Field(..., examples=["candidate"], description="candidate | commander | medical_officer")
    unit_id: str


def hash_identifier(value: str) -> str:
    """One-way hash used for logging WHO performed an action (e.g. which
    medical officer logged an intervention) without storing their real
    Username in an audit-trail collection. Same pattern used for the
    commander roster's anonymized candidate IDs."""
    return hashlib.sha256(value.encode()).hexdigest()[:16]


def create_access_token(data: dict, expires_delta: timedelta = None) -> tuple[str, str, datetime]:
    """Returns (token, jti, expires_at). The jti (JWT ID) is what /logout
    records in revoked_tokens — recording the jti instead of the raw token
    string keeps the blacklist collection independent of token contents."""
    to_encode = data.copy()
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "jti": jti})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token, jti, expire


def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        Username: str = payload.get("sub")
        jti: str = payload.get("jti")
        if Username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # NEW: reject a token that was explicitly logged out, even if it hasn't
    # naturally expired yet. Checked on every authenticated request.
    if jti and db.revoked_tokens.find_one({"jti": jti}):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This session has been logged out.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.personnel.find_one({"Username": Username})
    if user is None:
        raise credentials_exception
    user["_jti"] = jti  # stashed so /logout can revoke the current token without re-decoding
    return user


def require_role(*allowed_roles: str):
    """Dependency factory for RBAC: Depends(require_role('commander', 'medical_officer'))"""

    def role_checker(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.get('role')}' is not permitted to access this resource.",
            )
        return user

    return role_checker


@router.post("/register")
def register_personnel(user: UserRegister, db=Depends(get_db)):
    existing = db.personnel.find_one({"Username": user.Username})
    if existing:
        raise HTTPException(status_code=400, detail="This username is already registered.")

    doc = {
        "_id": gen_id(),
        "Username": user.Username,
        "full_name": user.full_name,
        "hashed_password": pwd_context.hash(user.password),
        "role": user.role,
        "unit_id": user.unit_id,
        "baseline_hr_bpm": None,
        "baseline_pitch_hz": None,
        "shift_type": None,
        "duty_hours_streak": None,
        "relax_hours_preceding": None,
        "created_at": datetime.now(timezone.utc),
    }
    db.personnel.insert_one(doc)
    return {"status": "success", "message": f"Account for {user.Username} registered with role {user.role}."}


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    user = db.personnel.find_one({"Username": form_data.username})
    if not user or not pwd_context.verify(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect personnel ID or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token, _jti, _exp = create_access_token(data={"sub": user["Username"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}


@router.get("/me")
def get_current_profile(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["Username"],
        "full_name": current_user["full_name"],
        "role": current_user["role"],
        "unit_id": current_user.get("unit_id"),
    }


@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    """Revokes THIS token only (not all of the user's sessions). Records its
    jti + original expiry in revoked_tokens; the TTL index cleans it up on
    its own once that expiry passes, so the blacklist never grows forever."""
    jti = current_user.get("_jti")
    if not jti:
        # Token predates the jti field (old token minted before this change) —
        # nothing to revoke by jti, but don't error the user's logout action.
        return {"status": "success", "message": "Logged out."}

    try:
        db.revoked_tokens.insert_one({
            "_id": gen_id(),
            "jti": jti,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        })
    except Exception:
        # Duplicate jti (double logout call) — already revoked, fine.
        pass

    return {"status": "success", "message": "Logged out."}
