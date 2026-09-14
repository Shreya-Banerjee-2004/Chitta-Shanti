"""
Automated email alert when an assessment comes back "Critical Fatigue".
Fires synchronously inside /full-evaluate right after the session is
persisted — see api/assessment_api.py.

Deliberately fails soft: an SMTP outage or missing config must never break
the candidate's assessment response (graceful degradation, per the project's
design principles). Errors are logged, never raised.

Known limitation carried over from the spec doc: this goes to ONE shared
inbox (WELFARE_ALERT_EMAIL). Personal/role-based routing is Future Scope #2.
"""
import os
import smtplib
import logging
from email.mime.text import MIMEText

logger = logging.getLogger("notifications")

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
WELFARE_ALERT_EMAIL = os.getenv("WELFARE_ALERT_EMAIL")


def send_critical_alert(personnel_id: str, session_id: str, unit_id: str | None = None) -> bool:
    """Sends a plain-text alert to the shared welfare inbox. Returns True on
    success, False on any failure (config missing, SMTP error) — callers
    should not treat False as fatal."""
    if not all([SMTP_HOST, SMTP_USER, SMTP_PASSWORD, WELFARE_ALERT_EMAIL]):
        logger.warning("Critical alert NOT sent — SMTP not fully configured in .env")
        return False

    body = (
        f"A Critical Fatigue classification was just recorded.\n\n"
        f"Personnel ID: {personnel_id}\n"
        f"Unit: {unit_id or 'unknown'}\n"
        f"Session ID: {session_id}\n\n"
        f"Full clinical detail is available to medical officers via "
        f"GET /api/assessment/welfare/triage."
    )
    msg = MIMEText(body)
    msg["Subject"] = f"[CRITICAL FATIGUE ALERT] Personnel {personnel_id}"
    msg["From"] = SMTP_USER
    msg["To"] = WELFARE_ALERT_EMAIL

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, [WELFARE_ALERT_EMAIL], msg.as_string())
        return True
    except Exception as exc:
        logger.error(f"Critical alert email failed to send: {exc}")
        return False
