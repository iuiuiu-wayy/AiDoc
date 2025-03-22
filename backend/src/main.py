from typing import Optional
from urllib.parse import urlencode

import requests
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import Depends, FastAPI, Request
from fastapi.security import HTTPBearer
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse

from src.api.pdf import ROUTER
from src import schema, utils
from src.config import get_settings
from src.db import User
from src.dependency import get_db, require_user

config = get_settings()

token_auth_scheme = HTTPBearer()
app = FastAPI(root_path=f"/{config.API_POSTFIX}")
app.include_router(ROUTER)
OAUTH = OAuth()


AUTH0 = OAUTH.register(
    "auth0",
    client_id=config.AUTH0_CLIENT_ID,
    client_secret=config.AUTH0_CLIENT_SECRET,
    api_base_url=config.AUTH0_BASE_URL,
    access_token_url=config.AUTH0_BASE_URL + "/oauth/token",
    authorize_url=config.AUTH0_BASE_URL + "/authorize",
    server_metadata_url=config.AUTH0_BASE_URL + "/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid profile email",
    },
)


@utils.time_cache(60 * 20)  # Re-verify user every 20 minutes
def _valid_auth0_user(token):
    resp = requests.get(
        config.AUTH0_BASE_URL + "/userinfo",
        headers={"Authorization": "Bearer " + token},
        timeout=30,
    )
    return resp.ok, resp.text


def chcekc_user(request: Request, sess=Depends(get_db)) -> Optional[User]:
    user_id = request.session.get("jwtpayload", {}).get("sub")
    if not user_id:
        return None
    user = sess.get(User, user_id)
    return user


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}


@app.get("/profile", response_model=schema.User)
async def profile(user=Depends(require_user)):
    return user


@app.get("/callback")
async def callback(request: Request, sess=Depends(get_db)):
    """The callback route for the OAuth2 flow"""
    try:
        token = await AUTH0.authorize_access_token(request)
    except OAuthError as exception:
        message = exception.args[0]
        if "verify your email" in message:
            return ("<p>Verify your email before using our platform</p>", 200)
        return (f"<p>{message}</p>", 401)
    userinfo = token["userinfo"]
    request.session["jwtpayload"] = userinfo
    request.session["profitle"] = {
        "user_id": userinfo["sub"],
        "name": userinfo["name"],
        "picture": userinfo["picture"],
    }
    user = sess.get(User, userinfo["sub"])
    if not user:
        user = User(user_id=userinfo["sub"], email=userinfo["email"])
        sess.add(user)
        sess.commit()
    callback_url = f'{config.REDIRECT_PROTOCOL}://{request.headers.get("host")}/{config.UI_POSTFIX}'

    callback_url = request.query_params.get("redirect_to", callback_url)

    return RedirectResponse(url=callback_url)


@app.get("/login")
async def private(request: Request, optioanl_user=Depends(chcekc_user)):
    """A valid access token is required to access this route"""
    if optioanl_user is not None:
        return RedirectResponse(url="/profile")
    redirect_to = request.query_params.get("redirect_to")
    callback_qs = "?" + urlencode({"redirect_to": redirect_to}) if redirect_to else ""
    callback_url = f"{config.REDIRECT_PROTOCOL}://{request.headers.get('host')}/{config.API_POSTFIX}/callback{callback_qs}"

    return await AUTH0.authorize_redirect(
        request, redirect_uri=callback_url, audience=config.AUTH0_AUDIENCE
    )


@app.get("/logout")
def logout(request: Request):
    """Logout the user and clear the session"""
    request.session.clear()
    return RedirectResponse(url=f"/{config.UI_POSTFIX}")


app.add_middleware(
    SessionMiddleware,
    secret_key="super-random-thing-that-should-be-changed",
    session_cookie="doublesession",
    max_age=60 * 60 * 24 * 7,
)
