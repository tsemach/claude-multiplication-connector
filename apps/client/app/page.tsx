'use client';

import { useEffect, useState } from 'react';

const apiBase =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') ??
  'http://localhost:3001';

interface MultiplicationResult {
  size: number;
  grid: number[][];
  timestamp: string;
  requestedBy: string;
}

export default function Page() {
  const [results, setResults] = useState<MultiplicationResult[]>([]);
  const [connected, setConnected] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    fetch(`${apiBase}/multiplication`)
      .then((r) => r.json())
      .then((data: MultiplicationResult[]) => setResults(data.slice().reverse()))
      .catch(() => {});

    const es = new EventSource(`${apiBase}/events/stream`);

    es.addEventListener('multiplication-result', (e: MessageEvent) => {
      const data: MultiplicationResult = JSON.parse(e.data as string);
      setResults((prev) => [data, ...prev]);
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    });

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    return () => es.close();
  }, []);

  return (
    <main className="page">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">×</span>
            <span className="logo-text">MathBoard</span>
          </div>
          <div className={`status ${connected ? 'status--live' : 'status--off'}`}>
            <span className="status-dot" />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>
      </header>

      <section className="hero">
        <p className="hero-label">Powered by Claude Desktop · MCP · NestJS · Next.js</p>
        <h1 className="hero-title">
          Multiplication<br />
          <em>Board</em>
        </h1>
        <p className="hero-sub">
          Ask Claude Desktop for an n×n multiplication board — the grid appears here in real time via MCP → NestJS → SSE.
        </p>
        <div className="prompt-example">
          <span className="prompt-tag">Try this prompt in Claude Desktop:</span>
          <code>&quot;Save a 9×9 multiplication board&quot;</code>
        </div>
      </section>

      {results.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">∅</div>
          <p>No results yet. Ask Claude Desktop for a board (e.g. n = 9).</p>
        </div>
      ) : (
        <div className={`results ${pulse ? 'results--pulse' : ''}`}>
          {results.map((r, i) => (
            <article key={`${r.size}-${r.timestamp}`} className={`card ${i === 0 ? 'card--new' : ''}`}>
              <div className="card-header">
                <div className="card-number">{r.size}×{r.size}</div>
                <div className="card-meta">
                  <span className="card-by">{r.requestedBy}</span>
                  <span className="card-time">{new Date(r.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="card-table">
                {r.grid.map((row, ri) => (
                  <div
                    key={ri}
                    className="card-row"
                    style={{
                      gridTemplateColumns: `repeat(${r.size}, minmax(0, 1fr))`,
                    }}
                  >
                    {row.map((product, ci) => (
                      <div key={ci} className="cell">
                        <span className="cell-eq">
                          <span className="cell-n">{ri + 1}</span>
                          <span className="cell-op">×</span>
                          <span className="cell-m">{ci + 1}</span>
                        </span>
                        <span className="cell-result">{product}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <style jsx>{`
        :global(*, *::before, *::after) {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        :global(body) {
          background: #0b0c10;
          color: #e8e6e0;
          font-family: 'Georgia', 'Times New Roman', serif;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, #1a2a1a 0%, #0b0c10 60%);
        }

        /* HEADER */
        .header {
          border-bottom: 1px solid #1e2620;
          padding: 0 2rem;
        }
        .header-inner {
          max-width: 900px;
          margin: 0 auto;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-icon {
          font-size: 1.6rem;
          color: #5aff7e;
          font-style: italic;
          line-height: 1;
        }
        .logo-text {
          font-size: 1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8a9e8e;
          font-family: 'Courier New', monospace;
        }
        .status {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: 'Courier New', monospace;
        }
        .status--live { color: #5aff7e; }
        .status--off  { color: #555; }
        .status-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: currentColor;
        }
        .status--live .status-dot {
          animation: blink 1.4s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        /* HERO */
        .hero {
          max-width: 900px;
          margin: 0 auto;
          padding: 5rem 2rem 3rem;
        }
        .hero-label {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4a6e50;
          font-family: 'Courier New', monospace;
          margin-bottom: 1.2rem;
        }
        .hero-title {
          font-size: clamp(3rem, 8vw, 6rem);
          line-height: 1.0;
          color: #d8e8d0;
          font-weight: normal;
          margin-bottom: 1.5rem;
        }
        .hero-title em {
          color: #5aff7e;
          font-style: italic;
        }
        .hero-sub {
          max-width: 540px;
          font-size: 1.05rem;
          line-height: 1.7;
          color: #6a7e6e;
          margin-bottom: 2rem;
        }
        .prompt-example {
          display: inline-flex;
          flex-direction: column;
          gap: 6px;
          background: #111814;
          border: 1px solid #2a3e2e;
          border-left: 3px solid #5aff7e;
          padding: 1rem 1.4rem;
          border-radius: 4px;
        }
        .prompt-tag {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #4a6e50;
          font-family: 'Courier New', monospace;
        }
        .prompt-example code {
          font-size: 0.95rem;
          color: #a8d8b0;
          font-family: 'Courier New', monospace;
        }

        /* EMPTY */
        .empty {
          max-width: 900px;
          margin: 4rem auto;
          padding: 0 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #3a4e3e;
        }
        .empty-icon {
          font-size: 4rem;
          line-height: 1;
        }
        .empty p { font-size: 0.9rem; font-family: 'Courier New', monospace; }

        /* RESULTS */
        .results {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 2rem 6rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .results--pulse {
          animation: resultsPulse 0.8s ease-out;
        }
        @keyframes resultsPulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }

        /* CARD */
        .card {
          background: #0f1612;
          border: 1px solid #1e2e22;
          border-radius: 8px;
          overflow-x: auto;
          overflow-y: hidden;
          transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-2px); }
        .card--new {
          border-color: #2a5e32;
          animation: slideIn 0.4s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.2rem 1.6rem;
          border-bottom: 1px solid #1a2a1e;
          background: #0d1410;
        }
        .card-number {
          font-size: 2.4rem;
          color: #5aff7e;
          font-style: italic;
          line-height: 1;
        }
        .card-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .card-by {
          font-size: 0.72rem;
          color: #4a6e50;
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .card-time {
          font-size: 0.8rem;
          color: #3a4e3e;
          font-family: 'Courier New', monospace;
        }
        .card-table {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: #141e18;
        }
        .card-row {
          display: grid;
          gap: 1px;
          background: #141e18;
        }
        .cell {
          background: #0f1612;
          padding: 0.9rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: background 0.15s;
        }
        .cell:hover { background: #131e16; }
        .cell-eq {
          display: flex;
          align-items: baseline;
          gap: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.72rem;
          color: #3a5e42;
        }
        .cell-n   { color: #5a8e6a; }
        .cell-op  { color: #2a4e32; }
        .cell-m   { color: #3a6e4a; }
        .cell-result {
          font-size: 1.3rem;
          color: #c8e8c0;
          font-style: italic;
          line-height: 1;
        }

        @media (max-width: 600px) {
          .cell { padding: 0.5rem 0.45rem; }
          .cell-eq { font-size: 0.62rem; }
          .cell-result { font-size: 1rem; }
          .hero-title { font-size: 3rem; }
        }
      `}</style>
    </main>
  );
}
