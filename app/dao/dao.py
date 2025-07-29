from app.dao.base import BaseDAO
from app.dao.models import Task, User


class UsersDAO(BaseDAO):
    model = User


class TaskssDAO(BaseDAO):
    model = Task
