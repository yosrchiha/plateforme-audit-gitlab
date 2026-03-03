"use client";
import { useSearchParams, useRouter } from "next/navigation";

export default function DifferencePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dataParam = searchParams.get("data");

  let compareData = null;
  if (dataParam) {
    try { compareData = JSON.parse(dataParam); } catch {}
  }

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
          margin-bottom: 28px;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .back-btn {
          background: transparent;
          border: 1px solid #1c1d26;
          border-radius: 7px;
          color: #555;
          font-size: 16px;
          width: 34px; height: 34px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .back-btn:hover { border-color: #333; color: #aaa; }

        .page-title { font-size: 20px; font-weight: 700; color: #fff; }
        .page-sub   { font-size: 11px; color: #444; font-family: 'JetBrains Mono', monospace; margin-top: 3px; }

        .btn-dashboard {
          padding: 8px 18px;
          background: #6c63ff;
          border: none; border-radius: 7px;
          color: #fff; font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .btn-dashboard:hover { background: #5b52e0; }

        /* META CARDS */
        .meta-row {
          display: flex;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .meta-card {
          background: #111218;
          border: 1px solid #1c1d26;
          border-radius: 10px;
          padding: 14px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 160px;
        }

        .meta-label {
          font-size: 10px;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: 'JetBrains Mono', monospace;
        }

        .meta-value {
          font-size: 14px;
          font-weight: 600;
          color: #e8e8f0;
          font-family: 'JetBrains Mono', monospace;
        }

        .branch-flow {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
        }

        .branch-tag {
          padding: 3px 9px;
          border-radius: 5px;
          font-size: 12px;
        }

        .branch-from { background: #6c63ff12; color: #9b91ff; border: 1px solid #6c63ff25; }
        .branch-to   { background: #00d4aa12; color: #00d4aa;  border: 1px solid #00d4aa25; }
        .branch-arrow { color: #333; font-size: 16px; }

        .commits-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffd16610;
          color: #ffd166;
          border: 1px solid #ffd16625;
          border-radius: 5px;
          padding: 3px 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 600;
        }

        /* SECTION */
        .section-label {
          font-size: 10px;
          font-weight: 600;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-count {
          background: #1c1d26;
          color: #666;
          border-radius: 20px;
          padding: 1px 8px;
          font-size: 10px;
        }

        /* FILE CARDS */
        .files-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .file-card {
          background: #111218;
          border: 1px solid #1c1d26;
          border-radius: 10px;
          overflow: hidden;
        }

        .file-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #1c1d26;
          gap: 10px;
        }

        .file-path {
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          color: #9b91ff;
          word-break: break-all;
        }

        .file-badge {
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          background: #6c63ff12;
          color: #9b91ff;
          border: 1px solid #6c63ff20;
          border-radius: 5px;
          padding: 2px 8px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .file-diff {
          margin: 0;
          padding: 16px;
          background: #0d0e12;
          color: #c9cad6;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          line-height: 1.7;
          overflow-x: auto;
          white-space: pre;
          max-height: 400px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #2a2b38 transparent;
        }

        /* diff coloring */
        .line-add  { color: #00d4aa; background: #00d4aa08; display: block; }
        .line-del  { color: #ff6b6b; background: #ff6b6b08; display: block; }
        .line-info { color: #555; display: block; }

        /* EMPTY */
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 10px;
          background: #111218;
          border: 1px solid #1c1d26;
          border-radius: 10px;
        }
        .empty-icon { font-size: 36px; opacity: 0.1; }
        .empty-txt  { font-size: 12px; color: #444; font-family: 'JetBrains Mono', monospace; }

        /* NO DATA */
        .no-data {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 100vh; gap: 12px;
          background: #0d0e12; font-family: 'Inter', sans-serif;
        }
        .no-data-txt { font-size: 13px; color: #444; font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {!compareData ? (
        <div className="no-data">
          <div style={{ fontSize: 36, opacity: 0.1 }}>◈</div>
          <div className="no-data-txt">Aucune donnée disponible</div>
          <button className="btn-dashboard" onClick={() => router.push("/dashboard")}>
            ← Retour à la dashboard
          </button>
        </div>
      ) : (
        <div className="page">

          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <button className="back-btn" onClick={() => router.push("/dashboard")}>←</button>
              <div>
                <div className="page-title">{compareData.project}</div>
                <div className="page-sub">Comparaison de branches</div>
              </div>
            </div>
            <button className="btn-dashboard" onClick={() => router.push("/dashboard")}>
              ▦ Dashboard
            </button>
          </div>

          {/* Meta */}
          <div className="meta-row">
            <div className="meta-card">
              <div className="meta-label">Branches comparées</div>
              <div className="branch-flow">
                <span className="branch-tag branch-from">{compareData.from_branch}</span>
                <span className="branch-arrow">→</span>
                <span className="branch-tag branch-to">{compareData.to_branch}</span>
              </div>
            </div>

            <div className="meta-card">
              <div className="meta-label">Commits</div>
              <div className="commits-badge">⊙ {compareData.commits_count} commit{compareData.commits_count !== 1 ? "s" : ""}</div>
            </div>

            <div className="meta-card">
              <div className="meta-label">Fichiers modifiés</div>
              <div className="meta-value">{compareData.files?.length ?? 0} fichier{compareData.files?.length !== 1 ? "s" : ""}</div>
            </div>
          </div>

          {/* Files */}
          <div className="section-label">
            Fichiers modifiés
            <span className="section-count">{compareData.files?.length ?? 0}</span>
          </div>

          {!compareData.files || compareData.files.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">◇</div>
              <div className="empty-txt">Aucun changement détecté</div>
            </div>
          ) : (
            <div className="files-list">
              {compareData.files.map((file: any, idx: number) => {
                const content: string = file.diff || file.content || "";
                const lines = content.split("\n");
                return (
                  <div key={idx} className="file-card">
                    <div className="file-header">
                      <span className="file-path">{file.path}</span>
                      <span className="file-badge">diff</span>
                    </div>
                    <pre className="file-diff">
                      {lines.map((line, i) => {
                        const cls = line.startsWith("+") ? "line-add"
                                  : line.startsWith("-") ? "line-del"
                                  : line.startsWith("@@") ? "line-info"
                                  : "";
                        return cls
                          ? <span key={i} className={cls}>{line}{"\n"}</span>
                          : line + "\n";
                      })}
                    </pre>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}
    </>
  );
}