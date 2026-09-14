"""
Field-level encryption for the clinical payload inside each assessment_sessions
document. Only this module touches the encryption key — nothing else in the
codebase should import `cryptography` directly.

Design: everything genuinely clinical/sensitive (raw HR/HRV, blink rate, brow
ratio, head jitter, voice pitch stats, AI reasoning/shap breakdown, and any
optional self-report text) is bundled into ONE dict, JSON-serialized, and
encrypted into a single opaque string with Fernet (AES-128-CBC + HMAC,
authenticated). That string is the only thing written for those fields — a
raw DB dump exposes ciphertext, not clinical numbers.

Classification, duty/rest hours, and IDs are NOT encrypted, because the app
needs to query/filter/sort on them (e.g. commander roster sorts by
created_at, welfare triage filters by classification == "Critical Fatigue").
Encrypting those would break every existing Mongo query in assessment_api.py.

Key management: FIELD_ENCRYPTION_KEY must be a urlsafe-base64 32-byte key
(Fernet.generate_key() output), set in Backend/.env. This is a known
limitation — see the project's documented gap around .env-based key storage
vs. a real secrets manager (Future Scope item #7).
"""
import os
import json
from cryptography.fernet import Fernet, InvalidToken

_KEY = os.getenv("FIELD_ENCRYPTION_KEY")
if not _KEY:
    raise RuntimeError(
        "FIELD_ENCRYPTION_KEY is not set. Generate one with:\n"
        "  python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"\n"
        "and put it in Backend/.env"
    )

_fernet = Fernet(_KEY.encode() if isinstance(_KEY, str) else _KEY)


def encrypt_blob(data: dict) -> str:
    """Serializes a dict to JSON and encrypts it. Returns a str safe to store
    directly in a Mongo field."""
    plaintext = json.dumps(data, default=str).encode("utf-8")
    return _fernet.encrypt(plaintext).decode("utf-8")


def decrypt_blob(token: str) -> dict:
    """Inverse of encrypt_blob. Raises ValueError on a corrupted/foreign
    token instead of leaking the underlying InvalidToken exception, so
    callers can catch one exception type."""
    if not token:
        return {}
    try:
        plaintext = _fernet.decrypt(token.encode("utf-8"))
        return json.loads(plaintext)
    except InvalidToken as exc:
        raise ValueError("Could not decrypt clinical blob — wrong key or corrupted data.") from exc



encrypt_clinical_data = encrypt_blob
decrypt_clinical_data = decrypt_blob