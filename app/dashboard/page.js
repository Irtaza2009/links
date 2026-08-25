"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [links, setLinks] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data.links || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(e, slug) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${slug}"? This can't be undone.`)) return;
    await fetch("/api/links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    load();
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="wrap">
      <div className="top-nav">
        <div className="brand">
          deep<span>linker</span>
        </div>
        <nav>
          <a href="/">New link</a>
          <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
            Log out
          </a>
        </nav>
      </div>

      <p className="eyebrow">Overview</p>
      <h1>Your links</h1>
      <p className="sub">Click any link below to see its full breakdown.</p>

      {!links && <p className="sub">Loading…</p>}

      {links && links.length === 0 && (
        <div className="empty">No links yet — go generate one.</div>
      )}

      {links && links.length > 0 && (
        <div className="link-list">
          {links.map((l) => (
            <a className="link-item" href={`/dashboard/${l.slug}`} key={l.slug}>
              <div style={{ minWidth: 0 }}>
                <div className="label">{l.label || `/l/${l.slug}`}</div>
                <div className="target">{l.target}</div>
              </div>
              <div className="row" style={{ gap: 10 }}>
                <span className="clicks-pill">{l.clicks} clicks</span>
                <button className="btn-danger btn" onClick={(e) => handleDelete(e, l.slug)}>
                  Delete
                </button>
              </div>
            </a>
          ))}
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}
