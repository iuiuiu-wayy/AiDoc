from fastapi import Depends, HTTPException, Request
from src.db import SessionLocal, User


def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


class UnauthenticatedError(HTTPException):
    """Unauthenticated error."""

    def __init__(self, description: str | None = None, *, no_redirect: bool = False):
        """Initialize the error."""
        self.no_redirect = no_redirect
        super().__init__(status_code=401, detail=description or "Authentication failed")


def require_user_or_guest(request: Request, sess=Depends(get_db)) -> User | None:
    user_id = request.session.get("jwtpayload", {}).get("sub")
    if not user_id:
        return None
    user = sess.get(User, user_id)
    return user


def require_user(user=Depends(require_user_or_guest)) -> User:
    if not user:
        raise UnauthenticatedError
    return user
