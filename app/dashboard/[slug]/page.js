"use client";

import { useEffect, useState } from "react";

function Bars({ title, data }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  if (!entries.length) return null;
  return (
    <>
      <p className="section-title">{title}</p>
      {entries.map(([k, v]) => (
        <div className="bar-row" key={k}>
          <span>{k}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(v / max) * 100}%` }} />
          </div>
          <span style={{ textAlign: "right" }}>{v}</span>
        </div>
      ))}
    </>
  );
}

function Sparkline({ daily }) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const values = days.map((d) => Number(daily?.[d] || 0));
  const max = Math.max(1, ...values);
  return (
    <div className="sparkline">
      {values.map((v, i) => (
        <div
          key={i}
          className="spark-bar"
          title={`${days[i]}: ${v}`}
          style={{ height: `${Math.max(4, (v / max) * 60)}px` }}
        />
      ))}
    </div>
  );
}

export default function LinkDetail({ params }) {
  const { slug } = params;
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/links/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="wrap">
        <div className="top-nav">
          <div className="brand">
            deep<span>linker</span>
          </div>
          <nav>
            <a href="/dashboard">Back</a>
          </nav>
        </div>
        <div className="empty">That link doesn't exist.</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="wrap">
        <p className="sub">Loading…</p>
      </div>
    );
  }

  const { link, stats } = data;

  return (
    <div className="wrap">
      <div className="top-nav">
        <div className="brand">
          deep<span>linker</span>
        </div>
        <nav>
          <a href="/dashboard">Back</a>
          <a href="/">New link</a>
        </nav>
      </div>

      <p className="eyebrow">/l/{link.slug}</p>
      <h1>{link.label || link.target}</h1>
      <p className="sub" style={{ wordBreak: "break-all" }}>
        → {link.target}
      </p>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="num">{stats.total}</div>
          <div className="lbl">Total opens</div>
        </div>
        <div className="stat-box">
          <div className="num">{stats.os?.iOS || 0}</div>
          <div className="lbl">from iOS</div>
        </div>
        <div className="stat-box">
          <div className="num">{stats.os?.Android || 0}</div>
          <div className="lbl">from Android</div>
        </div>
      </div>

      <p className="section-title">Last 14 days</p>
      <div className="card" style={{ padding: "18px 20px" }}>
        <Sparkline daily={stats.daily} />
      </div>

      <div style={{ marginTop: 10 }}>
        <Bars title="Operating system" data={stats.os} />
        <Bars title="Browser / in-app browser" data={stats.browser} />
        <Bars title="Referrer" data={stats.ref} />
      </div>

      <p className="section-title">Recent activity</p>
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>OS</th>
            <th>Browser</th>
            <th>Referrer</th>
          </tr>
        </thead>
        <tbody>
          {stats.events.length === 0 && (
            <tr>
              <td colSpan={4} style={{ color: "var(--text-mute)" }}>
                No clicks yet.
              </td>
            </tr>
          )}
          {stats.events.map((e, i) => (
            <tr key={i}>
              <td>{new Date(e.t).toLocaleString()}</td>
              <td>
                <span className="pill">{e.os}</span>
              </td>
              <td>{e.browser}</td>
              <td>{e.ref}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
