from fastapi import APIRouter
from app.services.gitlab_service import get_projects

router = APIRouter()

@router.get("/gitlab/projects")
def list_projects():
    return get_projects()