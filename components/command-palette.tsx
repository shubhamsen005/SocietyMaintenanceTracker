'use client';
import { useEffect, useState } from 'react';
import { Command, FileText, Bell, Building2, AlertTriangle, X } from 'lucide-react';

type Props={open:boolean;onClose:()=>void;onCreate:()=>void;onView:(view:string)=>void};
const actions=[
  {label:'Raise a complaint',hint:'C',icon:FileText,run:'create'},
  {label:'Open complaints',hint:'G C',icon:AlertTriangle,run:'complaints'},
  {label:'Open assets',hint:'G A',icon:Building2,run:'assets'},
  {label:'Create or view notices',hint:'G N',icon:Bell,run:'notice'},
];
export default function CommandPalette({open,onClose,onCreate,onView}:Props){const [query,setQuery]=useState('');useEffect(()=>{if(!open)setQuery('');},[open]);if(!open)return null;const filtered=actions.filter(action=>action.label.toLowerCase().includes(query.toLowerCase()));const choose=(run:string)=>{if(run==='create')onCreate();else onView(run);onClose();};return <div className="drawer-wrap" role="dialog" aria-modal="true" aria-label="Command palette"><div className="drawer-backdrop" onClick={onClose}/><div className="command-palette"><div className="command-search"><Command size={18}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search commands…"/><button onClick={onClose} aria-label="Close command palette"><X size={17}/></button></div><div className="command-results">{filtered.map(action=>{const Icon=action.icon;return <button key={action.run} onClick={()=>choose(action.run)}><Icon size={17}/><span>{action.label}</span><kbd>{action.hint}</kbd></button>})}{!filtered.length&&<p className="muted">No matching commands.</p>}</div><small className="command-footer">Use ↑ ↓ to browse · Enter to select · Esc to close</small></div></div>}
