from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import requests
from urllib.parse import quote
import base64
import re
from app.models.depot import Depot
from app.schemas.depot import DepotCreate, DepotResponse, DepotUpdate
from app.config.database import SessionLocal
from app.routes.auth import get_current_user  # <- ajoute ceci
from app.models.user import User  # <- pour type hint
from app.schemas.depot import DepotResponse
router = APIRouter(
    prefix="/depots",
    tags=["Depots"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=DepotResponse)
def create_depots(
    depot: DepotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # <- l'utilisateur connecté
):
    db_depot = Depot(
        nom=depot.nom,
        url_branche_principale=depot.url_branche_principale,
        url_branche_developpement=depot.url_branche_developpement,
        token_gitlab=depot.token_gitlab,
        proprietaire_id=current_user.id  # 🔥 Défini automatiquement
    )
    db.add(db_depot)
    db.commit()
    db.refresh(db_depot)
    return db_depot

@router.get("/", response_model=List[DepotResponse])
def read_depots(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Depot).offset(skip).limit(limit).all()

@router.get("/{depot_id}", response_model=DepotResponse)
def read_depots_by_id(depot_id: int, db: Session = Depends(get_db)):
    depot = db.query(Depot).filter(Depot.id == depot_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Depot non trouvé")
    return depot

@router.put("/{depot_id}", response_model=DepotResponse)
def update_depots(depot_id: int, depot_update: DepotUpdate, db: Session = Depends(get_db)):
    depot = db.query(Depot).filter(Depot.id == depot_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Depot non trouvé")
    for var, value in depot_update.dict(exclude_unset=True).items():
        setattr(depot, var, value)
    db.commit()
    db.refresh(depot)
    return depot

@router.delete("/{depot_id}")
def delete_depots(depot_id: int, db: Session = Depends(get_db)):
    depot = db.query(Depot).filter(Depot.id == depot_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Depot non trouvé")
    db.delete(depot)
    db.commit()
    return {"detail": "Depot supprimé avec succès"}

@router.get("/{depot_id}/compare")
def compare_depot(depot_id: int, db: Session = Depends(get_db)):
    # 1️⃣ Récupérer le dépôt depuis la DB
    depot = db.query(Depot).filter(Depot.id == depot_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Depot non trouvé")

    # 2️⃣ Extraire project_path pour GitLab API
    match = re.search(r"(?:git@gitlab.com:|https://gitlab.com/)(.+)\.git", depot.nom.strip())
    if not match:
        raise HTTPException(status_code=400, detail=f"Nom de dépôt invalide pour GitLab API: {depot.nom}")

    project_path = match.group(1)
    project_encoded = quote(project_path, safe='')

    # 3️⃣ Branches
    from_branch = depot.url_branche_principale.strip()  # dev2
    to_branch = depot.url_branche_developpement.strip()       # main

    print(f"DEBUG: project_path={project_path}")
    print(f"DEBUG: from_branch={from_branch}, to_branch={to_branch}")

    # 4️⃣ Comparer les branches via GitLab API
    compare_url = f"https://gitlab.com/api/v4/projects/{project_encoded}/repository/compare"
    headers = {"Authorization": f"Bearer {depot.token_gitlab}"}
    params = {"from": from_branch, "to": to_branch}

    response = requests.get(compare_url, headers=headers, params=params)

    # 5️⃣ Gestion d'erreur détaillée
    if response.status_code != 200:
        print(f"GitLab API error {response.status_code}: {response.text}")
        raise HTTPException(status_code=response.status_code, detail=f"GitLab API error: {response.text}")

    compare_data = response.json()
    print(f"DEBUG: compare_data keys: {compare_data.keys()}")

    if not compare_data.get("diffs") and not compare_data.get("commits"):
        return {"message": "Aucun changement détecté entre les branches", "files": []}

    # 6️⃣ Récupération du contenu des fichiers modifiés
    files_with_content = []
    for diff in compare_data.get("diffs", []):
        file_path = diff["new_path"]
        file_url = f"https://gitlab.com/api/v4/projects/{project_encoded}/repository/files/{quote(file_path, safe='')}"
        file_res = requests.get(file_url, headers=headers, params={"ref": from_branch})

        if file_res.status_code != 200:
            print(f"Impossible de récupérer {file_path}: {file_res.text}")
            continue

        file_data = file_res.json()
        content = base64.b64decode(file_data["content"]).decode("utf-8")
        files_with_content.append({
            "path": file_path,
            "content": content,
            "diff": diff.get("diff")
        })

    return {
        "project": project_path,
        "from_branch": from_branch,
        "to_branch": to_branch,
        "commits_count": len(compare_data.get("commits", [])),
        "files": files_with_content
    }

@router.get("/user/{user_id}", response_model=List[DepotResponse])
def get_user_depots(user_id: int, db: Session = Depends(get_db)):
    depots = db.query(Depot).filter(Depot.proprietaire_id == user_id).all()
    if not depots:
        raise HTTPException(status_code=404, detail="Aucun dépôt trouvé pour cet utilisateur")
    return depots