"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Depot {
  id: number;
  name: string;
  repo_url: string;
  branch: string;
  trigger_push: boolean;
  trigger_merge: boolean;
  trigger_schedule: boolean;
  last_analysis?: string;
  score_quality?: number;
  vulnerabilities?: number;
  coverage?: number;
  status?: "active" | "error";
}

export default function DepotsPage() {
  const router = useRouter();
  const [depots, setDepots] = useState<Depot[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "error">("all");

  useEffect(() => {
    const fetchDepots = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://127.0.0.1:8000/depots/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepots(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepots();
    window.addEventListener("focus", fetchDepots);
    return () => window.removeEventListener("focus", fetchDepots);
  }, []);

  const filtered = depots.filter((d) => {
    const matchSearch =
  (d.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
  (d.repo_url ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (d.status ?? "active") === filter;
    return matchSearch && matchFilter;
  });

  const scoreColor = (score?: number) => {
    if (!score) return "#555";
    if (score >= 80) return "#00d4aa";
    if (score >= 50) return "#ffd166";
    return "#ff6b6b";
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
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap; gap: 12px;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .back-btn {
          background: transparent; border: 1px solid #1c1d26;
          border-radius: 7px; color: #555; font-size: 16px;
          width: 34px; height: 34px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0;
        }
        .back-btn:hover { border-color: #333; color: #aaa; }
        .page-title { font-size: 20px; font-weight: 700; color: #fff; }
        .page-sub   { font-size: 11px; color: #444; font-family: 'JetBrains Mono', monospace; margin-top: 3px; }

        .btn-add {
          padding: 8px 18px; background: #6c63ff;
          border: none; border-radius: 7px; color: #fff;
          font-family: 'Inter', sans-serif; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: background 0.15s;
          white-space: nowrap;
        }
        .btn-add:hover { background: #5b52e0; }

        /* SUMMARY CARDS */
        .summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .sum-card {
          background: #111218; border: 1px solid #1c1d26;
          border-radius: 10px; padding: 16px 18px;
        }
        .sum-val { font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
        .sum-lbl { font-size: 10px; color: #444; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.07em; margin-top: 4px; }

        /* TOOLBAR */
        .toolbar {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px; flex-wrap: wrap;
        }
        .search-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: #444; font-size: 14px; pointer-events: none;
        }
        .search-input {
          width: 100%; background: #111218; border: 1px solid #1c1d26;
          border-radius: 8px; padding: 9px 12px 9px 34px;
          color: #e8e8f0; font-family: 'JetBrains Mono', monospace;
          font-size: 12px; outline: none; transition: border-color 0.15s;
        }
        .search-input::placeholder { color: #333; }
        .search-input:focus { border-color: #6c63ff55; }

        .filter-btns { display: flex; gap: 6px; }
        .filter-btn {
          padding: 7px 14px; border-radius: 7px; font-size: 12px;
          font-family: 'JetBrains Mono', monospace; cursor: pointer;
          border: 1px solid #1c1d26; background: transparent;
          color: #555; transition: all 0.15s;
        }
        .filter-btn:hover { border-color: #333; color: #aaa; }
        .filter-btn.active { background: #1e1f2e; color: #fff; border-color: #6c63ff40; }

        .count-label {
          font-size: 11px; color: #444;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }

        /* DEPOT CARDS */
        .depot-list { display: flex; flex-direction: column; gap: 12px; }

        .depot-card {
          background: #111218; border: 1px solid #1c1d26;
          border-radius: 12px; padding: 20px 22px;
          transition: border-color 0.15s, transform 0.15s;
          cursor: pointer;
        }
        .depot-card:hover { border-color: #6c63ff50; transform: translateY(-1px); }
        .depot-card.error { border-color: #ff6b6b25; }

        .depot-top {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px;
          margin-bottom: 14px;
        }
        .depot-name { font-size: 15px; font-weight: 700; color: #e8e8f0; margin-bottom: 3px; }
        .depot-url  {
          font-size: 11px; color: #3a3b4a;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 380px;
        }

        .depot-badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

        .status-badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; border-radius: 20px; padding: 3px 9px;
          font-family: 'JetBrains Mono', monospace; white-space: nowrap;
        }
        .status-active { color: #00d4aa; background: #00d4aa12; border: 1px solid #00d4aa20; }
        .status-error  { color: #ff6b6b; background: #ff6b6b12; border: 1px solid #ff6b6b20; }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; animation: blink 2s infinite; }
        .dot-active { background: #00d4aa; }
        .dot-error  { background: #ff6b6b; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        .branch-tag {
          font-size: 11px; color: #6c63ff;
          background: #6c63ff12; border: 1px solid #6c63ff20;
          border-radius: 5px; padding: 2px 8px;
          font-family: 'JetBrains Mono', monospace;
        }

        .trigger-tag { font-size: 10px; border-radius: 5px; padding: 2px 7px; font-family: 'JetBrains Mono', monospace; }
        .tag-push     { background: #00d4aa10; color: #00d4aa; border: 1px solid #00d4aa20; }
        .tag-merge    { background: #6c63ff10; color: #9b91ff; border: 1px solid #6c63ff20; }
        .tag-schedule { background: #ffd16610; color: #ffd166; border: 1px solid #ffd16620; }

        /* METRICS ROW */
        .divider { height: 1px; background: #1c1d26; margin: 14px 0; }

        .metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .metric { display: flex; flex-direction: column; gap: 6px; }
        .metric-label { font-size: 10px; color: #444; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.07em; }
        .metric-value { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
        .metric-sub   { font-size: 10px; color: #444; font-family: 'JetBrains Mono', monospace; }

        .progress-track { height: 3px; background: #1c1d26; border-radius: 10px; overflow: hidden; margin-top: 4px; }
        .progress-fill  { height: 100%; border-radius: 10px; transition: width 0.6s ease; }

        /* CARD FOOTER */
        .depot-footer {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-top: 14px; flex-wrap: wrap; gap: 8px;
        }
        .last-analysis { font-size: 11px; color: #444; font-family: 'JetBrains Mono', monospace; }

        .btn-analyse {
          padding: 6px 14px; background: transparent;
          border: 1px solid #6c63ff40; border-radius: 6px;
          color: #9b91ff; font-size: 12px; font-family: 'Inter', sans-serif;
          font-weight: 500; cursor: pointer; transition: all 0.15s;
        }
        .btn-analyse:hover { background: #6c63ff15; border-color: #6c63ff80; color: #fff; }

        /* EMPTY */
        .empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 70px 20px; gap: 12px;
          background: #111218; border: 1px solid #1c1d26;
          border-radius: 12px;
        }
        .empty-icon { font-size: 36px; opacity: 0.1; }
        .empty-txt  { font-size: 12px; color: #444; font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="page">

        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <button className="back-btn" onClick={() => router.push("/dashboard")}>←</button>
            <div>
              <div className="page-title">Dépôts GitLab</div>
              <div className="page-sub">Gérez et surveillez vos dépôts connectés</div>
            </div>
          </div>
          <button className="btn-add" onClick={() => router.push("/add-depot")}>
            + Ajouter un dépôt
          </button>
        </div>

        {/* Summary */}
        <div className="summary">
          <div className="sum-card">
            <div className="sum-val">{depots.length}</div>
            <div className="sum-lbl">Total dépôts</div>
          </div>
          <div className="sum-card">
            <div className="sum-val" style={{ color: "#00d4aa" }}>
              {depots.filter(d => (d.status ?? "active") === "active").length}
            </div>
            <div className="sum-lbl">Actifs</div>
          </div>
          <div className="sum-card">
            <div className="sum-val" style={{ color: "#ff6b6b" }}>
              {depots.filter(d => d.status === "error").length}
            </div>
            <div className="sum-lbl">En erreur</div>
          </div>
          <div className="sum-card">
            <div className="sum-val" style={{ color: "#ffd166" }}>
              {depots.length > 0
                ? Math.round(depots.reduce((acc, d) => acc + (d.score_quality ?? 0), 0) / depots.length)
                : 0}
            </div>
            <div className="sum-lbl">Score moyen</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Rechercher un dépôt..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-btns">
            {(["all", "active", "error"] as const).map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Tous" : f === "active" ? "Actifs" : "Erreurs"}
              </button>
            ))}
          </div>
          <span className="count-label">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* List */}
        <div className="depot-list">
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">◈</div>
              <div className="empty-txt">
                {depots.length === 0 ? "Aucun dépôt configuré" : "Aucun résultat pour cette recherche"}
              </div>
              {depots.length === 0 && (
                <button className="btn-add" style={{ marginTop: 8 }} onClick={() => router.push("/add-depot")}>
                  + Connecter un dépôt
                </button>
              )}
            </div>
          ) : (
            filtered.map((d) => {
              const status = d.status ?? "active";
              const score = d.score_quality;
              const sColor = scoreColor(score);
              return (
                <div key={d.id} className={`depot-card ${status === "error" ? "error" : ""}`}>

                  {/* Top */}
                  <div className="depot-top">
                    <div>
                      <div className="depot-name">{d.name}</div>
                      <div className="depot-url">{d.repo_url}</div>
                    </div>
                    <div className="depot-badges">
                      <div className={`status-badge ${status === "active" ? "status-active" : "status-error"}`}>
                        <div className={`status-dot ${status === "active" ? "dot-active" : "dot-error"}`} />
                        {status === "active" ? "actif" : "erreur"}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                    <span className="branch-tag">⑂ {d.branch}</span>
                    {d.trigger_push     && <span className="trigger-tag tag-push">push</span>}
                    {d.trigger_merge    && <span className="trigger-tag tag-merge">merge</span>}
                    {d.trigger_schedule && <span className="trigger-tag tag-schedule">planifié</span>}
                  </div>

                  <div className="divider" />

                  {/* Metrics */}
                  <div className="metrics">
                    <div className="metric">
                      <div className="metric-label">Score qualité</div>
                      <div className="metric-value" style={{ color: sColor }}>{score ?? "—"}{score !== undefined ? "%" : ""}</div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${score ?? 0}%`, background: sColor }} />
                      </div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Vulnérabilités</div>
                      <div className="metric-value" style={{ color: d.vulnerabilities ? "#ff6b6b" : "#00d4aa" }}>
                        {d.vulnerabilities ?? "0"}
                      </div>
                      <div className="metric-sub">{d.vulnerabilities ? "à corriger" : "aucune détectée"}</div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Couverture tests</div>
                      <div className="metric-value" style={{ color: "#9b91ff" }}>{d.coverage ?? "—"}{d.coverage !== undefined ? "%" : ""}</div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${d.coverage ?? 0}%`, background: "#6c63ff" }} />
                      </div>
                    </div>
                    <div className="metric">
                      <div className="metric-label">Dernière analyse</div>
                      <div className="metric-value" style={{ fontSize: 13, color: "#888", fontFamily: "JetBrains Mono" }}>
                        {d.last_analysis ?? "—"}
                      </div>
                      <div className="metric-sub">analyse LLM</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="depot-footer">
                    <span className="last-analysis">
                      {d.last_analysis ? `Analysé le ${d.last_analysis}` : "Jamais analysé"}
                    </span>
                    <button className="btn-analyse" onClick={() => router.push(`/analyses?depot=${d.id}`)}>
                      ◎ Lancer une analyse
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </>
  );
}