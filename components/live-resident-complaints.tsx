'use client';

import { useCallback, useEffect, useState } from 'react';

type History={id:string;createdAt:string;eventType:string;note:string|null;actor:{name:string;role:string}};
type Complaint={id:string;displayId:string;description:string;status:'OPEN'|'IN_PROGRESS'|'RESOLVED';category:string;createdAt:string;histories:History[]};

export default function LiveResidentComplaints(){
  const [items,setItems]=useState<Complaint[]>([]);
  const [error,setError]=useState('');
  const load=useCallback(()=>fetch('/api/complaints?limit=50').then(r=>r.ok?r.json():Promise.reject()).then(data=>setItems(data.items)).catch(()=>setError('Unable to load your reports.')),[]);
  useEffect(()=>{load();},[load]);
  const feedback=async(id:string,resolved:boolean)=>{const response=await fetch(`/api/complaints/${id}/feedback`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resolved,note:resolved?'Resident confirmed the repair.':'Resident reported the issue is still present.'})});if(response.ok)load();else setError('Unable to save your feedback.');};
  return <section className="card"><span className="section-label">YOUR COMPLAINTS</span><h2 style={{margin:'7px 0 13px'}}>Full status history</h2>{error&&<p className="red">{error}</p>}{items.map(item=><article key={item.id} style={{borderTop:'1px solid var(--line)',paddingTop:14,marginTop:14}}><b>{item.displayId} · {item.category}</b><small>{item.description}</small><p>Status: {item.status.replace('_',' ')}</p><div className="timeline">{item.histories.map(history=><div key={history.id}><i className="done"/><span><b>{history.eventType.replaceAll('_',' ')}</b><small>{history.actor.name} · {new Date(history.createdAt).toLocaleString()}</small>{history.note&&<p>{history.note}</p>}</span></div>)}</div>{item.status==='RESOLVED'&&<p><button className="text-btn" onClick={()=>feedback(item.id,true)}>Yes, resolved</button> · <button className="text-btn" onClick={()=>feedback(item.id,false)}>Still an issue</button></p>}</article>)}{!items.length&&!error&&<p className="muted">You have not reported any complaints yet.</p>}</section>;
}
