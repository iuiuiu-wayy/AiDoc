import pydantic

class User(pydantic.BaseModel):
    user_id: str
    email: str
