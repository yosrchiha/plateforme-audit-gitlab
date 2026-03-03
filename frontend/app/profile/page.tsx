"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://127.0.0.1:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Erreur récupération user:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    router.push("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #0d0e12;
          font-family: 'Inter', sans-serif;
          color: #c9cad6;
          padding: 32px;
        }

        /* TOPBAR */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .back-btn {
          background: transparent;
          border: 1px solid #1c1d26;
          border-radius: 7px;
          color: #555; font-size: 16px;
          width: 34px; height: 34px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .back-btn:hover { border-color: #333; color: #aaa; }
        .page-title { font-size: 20px; font-weight: 700; color: #fff; }
        .page-sub   { font-size: 11px; color: #444; font-family: 'JetBrains Mono', monospace; margin-top: 3px; }

        .btn-logout {
          padding: 8px 18px;
          background: transparent;
          border: 1px solid #ff6b6b30;
          border-radius: 7px;
          color: #ff6b6b;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .btn-logout:hover { background: #ff6b6b10; border-color: #ff6b6b55; }

        /* LAYOUT */
        .layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 20px;
          max-width: 900px;
        }

        /* CARD */
        .card {
          background: #111218;
          border: 1px solid #1c1d26;
          border-radius: 12px;
          padding: 24px;
        }

        /* PROFILE CARD */
        .profile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
        }

        .avatar-ring {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6c63ff, #00d4aa);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 700; color: #000;
        }

        .profile-name {
          font-size: 18px; font-weight: 700; color: #fff;
        }

        .profile-role {
          display: inline-flex; align-items: center;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          background: #6c63ff15;
          color: #9b91ff;
          border: 1px solid #6c63ff25;
          border-radius: 20px;
          padding: 3px 12px;
        }

        .divider { height: 1px; background: #1c1d26; width: 100%; }

        .stat-row {
          display: flex; justify-content: space-around; width: 100%; gap: 8px;
        }

        .mini-stat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .mini-val  { font-size: 20px; font-weight: 700; color: #fff; }
        .mini-lbl  { font-size: 10px; color: #444; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.06em; text-align: center; }

        .profile-joined {
          font-size: 11px; color: #444;
          font-family: 'JetBrains Mono', monospace;
        }

        /* DETAILS CARD */
        .section-label {
          font-size: 10px; font-weight: 600; color: #444;
          text-transform: uppercase; letter-spacing: 0.1em;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 16px;
        }

        .info-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }

        .info-row {
          display: flex; align-items: center;
          padding: 12px 14px;
          background: #0d0e12;
          border: 1px solid #1c1d26;
          border-radius: 8px;
          gap: 12px;
        }

        .info-icon {
          font-size: 14px; width: 20px; text-align: center;
          color: #444; flex-shrink: 0;
        }

        .info-content { flex: 1; }
        .info-label { font-size: 10px; color: #444; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
        .info-value { font-size: 13px; color: #e8e8f0; font-family: 'JetBrains Mono', monospace; }

        .info-badge {
          font-size: 10px; font-family: 'JetBrains Mono', monospace;
          padding: 2px 8px; border-radius: 5px; flex-shrink: 0;
        }
        .badge-active   { background: #00d4aa10; color: #00d4aa; border: 1px solid #00d4aa20; }
        .badge-gitlab   { background: #ff6b3510; color: #ff9a70; border: 1px solid #ff6b3520; }
        .badge-verified { background: #6c63ff10; color: #9b91ff; border: 1px solid #6c63ff20; }

        /* ACTIVITY */
        .activity-list { display: flex; flex-direction: column; gap: 8px; }

        .activity-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: #0d0e12;
          border: 1px solid #1c1d26;
          border-radius: 8px;
        }

        .activity-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }

        .activity-text { font-size: 12px; color: #888; flex: 1; }
        .activity-text span { color: #c9cad6; font-weight: 500; }
        .activity-time { font-size: 10px; color: #333; font-family: 'JetBrains Mono', monospace; }

        /* LOADING */
        .loading {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #0d0e12; font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: #444;
        }
      `}</style>

      {loading ? (
        <div className="loading">chargement...</div>
      ) : !user ? (
        <div className="loading">
          Impossible de charger le profil.{" "}
          <button className="back-btn" style={{ marginLeft: 12 }} onClick={() => router.push("/dashboard")}>← Retour</button>
        </div>
      ) : (
        <div className="page">

          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <button className="back-btn" onClick={() => router.push("/dashboard")}>←</button>
              <div>
                <div className="page-title">Mon profil</div>
                <div className="page-sub">Informations du compte</div>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>

          <div className="layout">

            {/* Colonne gauche — carte profil */}
            <div className="card profile-card">
              <div className="avatar-ring">
                {user.username?.[0]?.toUpperCase() ?? "U"}
              </div>

              <div>
                <div className="profile-name">{user.username}</div>
                <div style={{ marginTop: 6 }}>
                  <span className="profile-role">admin</span>
                </div>
              </div>

              <div className="divider" />

              <div className="stat-row">
                <div className="mini-stat">
                  <div className="mini-val">0</div>
                  <div className="mini-lbl">Dépôts</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-val">0</div>
                  <div className="mini-lbl">Analyses</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-val">0</div>
                  <div className="mini-lbl">Issues</div>
                </div>
              </div>

              <div className="divider" />

              <div className="profile-joined">
                Membre depuis {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </div>
            </div>

            {/* Colonne droite */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Informations du compte */}
              <div className="card">
                <div className="section-label">Informations du compte</div>
                <div className="info-list">

                  <div className="info-row">
                    <span className="info-icon">◈</span>
                    <div className="info-content">
                      <div className="info-label">Identifiant</div>
                      <div className="info-value">#{user.id}</div>
                    </div>
                  </div>

                  <div className="info-row">
                    <span className="info-icon">@</span>
                    <div className="info-content">
                      <div className="info-label">Nom d'utilisateur</div>
                      <div className="info-value">{user.username}</div>
                    </div>
                    <span className="info-badge badge-verified">vérifié</span>
                  </div>

                  <div className="info-row">
                    <span className="info-icon">✉</span>
                    <div className="info-content">
                      <div className="info-label">Adresse email</div>
                      <div className="info-value">{user.email}</div>
                    </div>
                    <span className="info-badge badge-active">actif</span>
                  </div>

                  <div className="info-row">
                    <span className="info-icon">⊙</span>
                    <div className="info-content">
                      <div className="info-label">Connexion via</div>
                      <div className="info-value">GitLab OAuth</div>
                    </div>
                    <span className="info-badge badge-gitlab">gitlab</span>
                  </div>

                </div>
              </div>

              {/* Activité récente */}
              <div className="card">
                <div className="section-label">Activité récente</div>
                <div className="activity-list">
                  {[
                    { color: "#6c63ff", text: <>Connexion via <span>GitLab OAuth</span></>, time: "maintenant" },
                    { color: "#00d4aa", text: <>Compte <span>créé</span> avec succès</>, time: "aujourd'hui" },
                  ].map((item, i) => (
                    <div className="activity-row" key={i}>
                      <div className="activity-dot" style={{ background: item.color }} />
                      <div className="activity-text">{item.text}</div>
                      <div className="activity-time">{item.time}</div>
                    </div>
                  ))}

                  {/* Placeholder si pas d'activité */}
                  <div className="activity-row" style={{ opacity: 0.3 }}>
                    <div className="activity-dot" style={{ background: "#333" }} />
                    <div className="activity-text">Aucune autre activité enregistrée</div>
                    <div className="activity-time">—</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}