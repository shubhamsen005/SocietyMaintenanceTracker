'use client';

import { useEffect, useState } from 'react';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
type Config = { id: string; category: string; priority: Priority; thresholdHours: number };
const categories = ['Elevator', 'Plumbing', 'Electrical', 'Security', 'General'];

export default function SlaManager() {
  const [items, setItems] = useState<Config[]>([]);
  const [category, setCategory] = useState('Elevator');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [days, setDays] = useState('0.5');
  const [message, setMessage] = useState('');
  const load = () => fetch('/api/sla-config').then(r => r.ok ? r.json() : Promise.reject()).then(data => setItems(data.items)).catch(() => setMessage('Unable to load SLA settings.'));
  useEffect(() => { load(); }, []);
  const save = async () => {
    setMessage('');
    const thresholdHours = Math.max(1, Math.round(Number(days) * 24));
    const response = await fetch('/api/sla-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category, priority, thresholdHours }) });
    if (!response.ok) { setMessage('Unable to save the SLA threshold.'); return; }
    setMessage('SLA threshold saved. New complaints and priority changes will use it.');
    load();
  };
  return <div className="page"><div className="eyebrow">WORKFLOW SETTINGS</div><div className="heading-row"><div><h1>Overdue thresholds</h1><p>Configure how long each category and priority may remain unresolved.</p></div></div><section className="card form-card"><div className="form-grid"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(value=><option key={value}>{value}</option>)}</select></label><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value as Priority)}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label></div><label>Threshold in days<input type="number" min="0.05" step="0.25" value={days} onChange={e=>setDays(e.target.value)}/></label><button className="primary" onClick={save}>Save threshold</button>{message&&<p style={{marginTop:12}}>{message}</p>}</section><section className="card" style={{marginTop:16}}><span className="section-label">CONFIGURED THRESHOLDS</span>{items.map(item=><div className="match-note" key={item.id}><span><b>{item.category} · {item.priority}</b><small>{item.thresholdHours} hours ({Number((item.thresholdHours/24).toFixed(2))} days)</small></span></div>)}{!items.length&&<p className="muted" style={{marginTop:12}}>No overrides yet; priority defaults apply.</p>}</section></div>;
}
