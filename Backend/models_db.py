"""
No ORM classes here — Mongo is schemaless, so this file just documents the
document shapes each collection holds, plus index setup and an id helper.
Collections used: personnel, assessment_sessions, welfare_interventions,
revoked_tokens.
"""
from pymongo import ASCENDING, DESCENDING
from database import db
import uuid


def gen_id() -> str:
    return str(uuid.uuid4())


def ensure_indexes():
    """Call once at startup (see main.py). Safe to call repeatedly — Mongo
    no-ops if the index already exists with the same spec."""
    db.personnel.create_index([("Username", ASCENDING)], unique=True)
    db.assessment_sessions.create_index([("personnel_id", ASCENDING), ("created_at", DESCENDING)])
    db.assessment_sessions.create_index([("classification", ASCENDING), ("created_at", DESCENDING)])
    db.welfare_interventions.create_index([("personnel_id", ASCENDING)])
    db.welfare_interventions.create_index([("session_id", ASCENDING)])
    
    # TTL index: Mongo auto-deletes a revoked_tokens doc once "expires_at" is
    # in the past — matching token expiration so the blacklist never grows.
    db.revoked_tokens.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
    db.revoked_tokens.create_index([("jti", ASCENDING)], unique=True)