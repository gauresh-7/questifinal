import os
import json
import tempfile
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()


def _init_firebase():
    """
    Initialize Firebase Admin SDK.

    Priority:
      1. GOOGLE_APPLICATION_CREDENTIALS_JSON  — full service account JSON as env var (Render)
      2. GOOGLE_APPLICATION_CREDENTIALS       — path to a local service account file (dev)
      3. FIREBASE_PROJECT_ID only             — works when running inside GCP (App Engine etc.)
    """
    if firebase_admin._apps:
        return

    sa_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
    if sa_json:
        # Write the JSON string to a temp file so the SDK can read it
        sa_dict = json.loads(sa_json)
        tmp = tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False
        )
        json.dump(sa_dict, tmp)
        tmp.close()
        cred = credentials.Certificate(tmp.name)
        firebase_admin.initializeApp(cred)
        return

    local_creds = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if local_creds:
        cred = credentials.Certificate(local_creds)
        firebase_admin.initializeApp(cred)
        return

    project_id = os.getenv("FIREBASE_PROJECT_ID")
    if project_id:
        firebase_admin.initializeApp(options={"projectId": project_id})
        return

    # Last resort — SDK will try to find credentials itself
    firebase_admin.initializeApp()


try:
    _init_firebase()
except Exception as e:
    print(f"Warning: Firebase Admin initialization failed: {e}")
    print(
        "Set GOOGLE_APPLICATION_CREDENTIALS_JSON (for Render) or "
        "GOOGLE_APPLICATION_CREDENTIALS (for local dev) in your .env"
    )

security = HTTPBearer()


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
):
    """Verify Firebase ID token and return the decoded user payload."""
    token = creds.credentials
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

