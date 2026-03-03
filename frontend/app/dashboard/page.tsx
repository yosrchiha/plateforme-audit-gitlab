"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";


interface Repository {
  id: number;
  name: string;
  repo_url: string;
  branch: string;
  trigger_push: boolean;
  trigger_merge: boolean;
  trigger_schedule: boolean;
}

const menuItems = [
  { key: "dashboard", label: "Vue d'ensemble", icon: "▦" },
  { key: "repositories", label: "Dépôts", icon: "◈" },
  { key: "analyses", label: "Analyses", icon: "◎" },
  { key: "issues", label: "Issues", icon: "◇" },
  { key: "merge_requests", label: "Merge Requests", icon: "⟁" },
  { key: "pipelines", label: "Pipelines", icon: "⊞" },
  { key: "settings", label: "Configuration", icon: "⊙" },
];

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) localStorage.setItem("token", token);
  }, []);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get("http://127.0.0.1:8000/depots/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRepositories(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des dépôts :", error);
      }
    };
    fetchRepositories();
  }, []);

  const stats = [
    { label: "Dépôts actifs",       value: repositories.length },
    { label: "Score qualité moyen", value: 0 },
    { label: "Vulnérabilités",      value: 0 },
    { label: "Tests générés",       value: 0 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .root { display: flex; height: 100vh; background: #0d0e12; color: #c9cad6; font-family: 'Inter', sans-serif; }

        /* SIDEBAR */
        .sidebar {
          width: 220px; min-width: 220px;
          background: #111218;
          border-right: 1px solid #1c1d26;
          display: flex; flex-direction: column;
          padding: 24px 0;
        }
        .logo {
          display: flex; align-items: center; gap: 10px;
          padding: 0 20px 24px;
          border-bottom: 1px solid #1c1d26;
        }
        .logo-box {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #6c63ff, #00d4aa);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; color: #000; flex-shrink: 0;
        }
        .logo-name { font-size: 14px; font-weight: 700; color: #fff; }
        .logo-tag  { font-size: 10px; color: #444; font-family: 'JetBrains Mono', monospace; }

        .nav { padding: 16px 12px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .nav-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 7px;
          background: transparent; border: none;
          color: #555; font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer; width: 100%; text-align: left;
          transition: all 0.15s;
        }
        .nav-btn:hover { background: #1a1b24; color: #aaa; }
        .nav-btn.active {
          background: #1e1f2e; color: #fff;
          border-left: 2px solid #6c63ff; padding-left: 8px;
        }
        .nav-icon { font-size: 14px; width: 18px; text-align: center; }

        .sidebar-bottom {
          padding: 16px 20px; border-top: 1px solid #1c1d26;
          display: flex; align-items: center; gap: 10px;
        }
        .avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #6c63ff, #00d4aa);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #000; flex-shrink: 0;
        }
        .u-name { font-size: 12px; font-weight: 600; color: #bbb; }
        .u-role  { font-size: 10px; color: #444; font-family: 'JetBrains Mono', monospace; }

        /* MAIN */
        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 28px; border-bottom: 1px solid #1c1d26;
          background: #0d0e12; flex-shrink: 0;
        }
        .page-title { font-size: 18px; font-weight: 700; color: #fff; }
        .page-sub   { font-size: 11px; color: #444; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }

        .btn-add {
          padding: 8px 18px; background: #6c63ff;
          border: none; border-radius: 7px;
          color: #fff; font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .btn-add:hover { background: #5b52e0; }

        /* CONTENT */
        .content { flex: 1; overflow-y: auto; padding: 28px; }

        /* STATS */
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
        .stat {
          background: #111218; border: 1px solid #1c1d26;
          border-radius: 10px; padding: 18px 20px;
        }
        .stat-val  { font-size: 30px; font-weight: 700; color: #fff; letter-spacing: -0.02em; margin-bottom: 4px; }
        .stat-lbl  { font-size: 11px; color: #555; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.06em; }

        /* REPOS */
        .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .section-title { font-size: 11px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'JetBrains Mono', monospace; }

        .repo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
        .repo-card {
          background: #111218; border: 1px solid #1c1d26;
          border-radius: 10px; padding: 20px;
          transition: border-color 0.15s, transform 0.15s; cursor: pointer;
        }
        .repo-card:hover { border-color: #6c63ff55; transform: translateY(-1px); }

        .repo-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .repo-name { font-size: 14px; font-weight: 600; color: #e8e8f0; }
        .status-badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; color: #00d4aa;
          background: #00d4aa12; border: 1px solid #00d4aa20;
          border-radius: 20px; padding: 3px 8px;
          font-family: 'JetBrains Mono', monospace;
        }
        .dot { width: 5px; height: 5px; background: #00d4aa; border-radius: 50%; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        .repo-url   { font-size: 11px; color: #3a3b4a; font-family: 'JetBrains Mono', monospace; margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .repo-branch {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; color: #6c63ff;
          background: #6c63ff12; border: 1px solid #6c63ff20;
          border-radius: 5px; padding: 2px 8px;
          font-family: 'JetBrains Mono', monospace; margin-bottom: 12px;
        }
        .repo-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .tag { font-size: 10px; border-radius: 5px; padding: 2px 7px; font-family: 'JetBrains Mono', monospace; }
        .tag-push     { background: #00d4aa10; color: #00d4aa; border: 1px solid #00d4aa20; }
        .tag-merge    { background: #6c63ff10; color: #9b91ff; border: 1px solid #6c63ff20; }
        .tag-schedule { background: #ffd16610; color: #ffd166; border: 1px solid #ffd16620; }

        /* EMPTY */
        .empty {
          grid-column: 1/-1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; padding: 60px; gap: 10px;
        }
        .empty-icon { font-size: 40px; opacity: 0.1; }
        .empty-txt  { font-size: 12px; color: #444; font-family: 'JetBrains Mono', monospace; }

        /* PLACEHOLDER */
        .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 10px; opacity: 0.3; }
        .placeholder-icon { font-size: 40px; }
        .placeholder-txt  { font-size: 11px; color: #555; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase; }
      `}</style>

      <div className="root">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-box">A</div>
            <div>
              <div className="logo-name">AuditPlatform</div>
              <div className="logo-tag">GitLab · LLM</div>
            </div>
          </div>

          <nav className="nav">
            {menuItems.map((item) => (
             <button
  key={item.key}
  className={`nav-btn ${activeMenu === item.key ? "active" : ""}`}
  onClick={() => {
    if(item.key === "repositories") {
      router.push("/depots");
    } else {
      setActiveMenu(item.key);
    }
  }}
>
  <span className="nav-icon">{item.icon}</span>
  {item.label}
</button>
            ))}
          </nav>

          <div 
  className="sidebar-bottom"
  onClick={() => router.push("/profile")}
  style={{ cursor: "pointer" }}
>
  <div className="avatar">U</div>
  <div>
    <div className="u-name">Utilisateur</div>
    <div className="u-role">admin</div>
  </div>
</div>
        </aside>

        {/* MAIN */}
        <div className="main">
          <header className="topbar">
            <div>
              <div className="page-title">{menuItems.find((m) => m.key === activeMenu)?.label}</div>
              <div className="page-sub">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <button className="btn-add" onClick={() => router.push("/add-repository")}>
              + Ajouter un dépôt
            </button>
          </header>

          <div className="content">
            {activeMenu === "dashboard" && (
              <>
                {/* Stats — toutes à 0 au début */}
                <div className="stats">
                  {stats.map((s, i) => (
                    <div className="stat" key={i}>
                      <div className="stat-val">{s.value}</div>
                      <div className="stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Liste dépôts */}
                <div className="section-head">
                  <div className="section-title">Dépôts connectés</div>
                  <span style={{ fontSize: 11, color: "#444", fontFamily: "JetBrains Mono" }}>
                    {repositories.length} dépôt{repositories.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="repo-grid">
                  {repositories.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon">◈</div>
                      <div className="empty-txt">Aucun dépôt configuré</div>
                      <button className="btn-add" style={{ marginTop: 12 }} onClick={() => router.push("/add-repository")}>
                        + Connecter un dépôt
                      </button>
                    </div>
                  ) : (
                    repositories.map((repo) => (
                      <div key={repo.id} className="repo-card">
                        <div className="repo-top">
                          <div className="repo-name">{repo.name}</div>
                          <div className="status-badge"><div className="dot" />actif</div>
                        </div>
                        <div className="repo-url">{repo.repo_url}</div>
                        <div className="repo-branch">⑂ {repo.branch}</div>
                        <div className="repo-tags">
                          {repo.trigger_push     && <span className="tag tag-push">push</span>}
                          {repo.trigger_merge    && <span className="tag tag-merge">merge</span>}
                          {repo.trigger_schedule && <span className="tag tag-schedule">planifié</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeMenu !== "dashboard" && (
              <div className="placeholder">
                <div className="placeholder-icon">{menuItems.find((m) => m.key === activeMenu)?.icon}</div>
                <div className="placeholder-txt">{menuItems.find((m) => m.key === activeMenu)?.label} — en développement</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}