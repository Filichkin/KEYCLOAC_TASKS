from pydantic import BaseModel


class SUserId(BaseModel):
    user_id: str


class AddUser(BaseModel):
    id: str
    email: str
    email_verified: bool
    username: str
    name: str
    job_title: str
    surname: str


class AddTask(BaseModel):
    title: str
    content: str


class AddTaskWithUserId(AddTask, SUserId):
    pass
