import requests
from app.config.settings import GITLAB_TOKEN, GITLAB_URL

headers = {
    "PRIVATE-TOKEN": GITLAB_TOKEN
}

def get_projects():
    response = requests.get(f"{GITLAB_URL}/projects", headers=headers)
    return response.json()