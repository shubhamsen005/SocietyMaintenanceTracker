'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Status = 'OPEN'|'IN_PROGRESS'|'RESOLVED';
type Priority = 'LOW'|'MEDIUM'|'HIGH';
type Item = { id:string; displayId:string; category:string; description:string; building:string; floor:string|null; status:Status; priority:Priority; dueAt:string; createdAt:string; asset:{name:string}|null };
const statuses = ['All','OPEN','IN_PROGRESS','RESOLVED'];
const categories = ['All','Elevator','Plumbing','Electrical','Security','General'];

export default function LiveComplaints() {
  const [items,setItems]=useState<Item[]>([]);
  const [status,setStatus]=useState('All');
  const [category,setCategory]=useState('All');
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const load=useCallback(async()=>{setLoading(true);setError('');const query=new URLSearchParams();if(status!=='All')query.set('status',status);if(category!=='All')query.set('category',category);if(from)query.set('from',from);if(to)query.set('to',to);const response=await fetch(`/api/complaints?${query}`);if(!response.ok){setError('Could not load complaints. Please check the filters or sign in again.');setLoading(false);return;}const data=await response.json();setItems(data.items);setLoading(false);},[status,category,from,to]);
  useEffect(()=>{load();},[load]);
  const ordered=useMemo(()=>[...items].sort((a,b)=>{const now=Date.now();const aOverdue=a.status!=='RESOLVED'&&new Date(a.dueAt).getTime()<now;const bOverdue=b.status!=='RESOLVED'&&new Date(b.dueAt).getTime()<now;return Number(bOverdue)-Number(aOverdue)||new Date(a.dueAt).getTime()-new Date(b.dueAt).getTime();}),[items]);
  const changeStatus=async(id:string,next:Status)=>{const response=await fetch(`/api/complaints/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next,note:'Updated from the operations console.'})});if(response.ok)load();else setError('Status update was not permitted for this account.');};
  const changePriority=async(id:string,priority:Priority)=>{const response=await fetch(`/api/complaints/${id}/priority`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({priority,note:'Priority updated from the operations console.'})});if(response.ok)load();else setError('Priority update could not be saved.');};
  return <div className="page"><div className="eyebrow">COMPLAINT MANAGEMENT</div><div className="heading-row"><div><h1>All complaints</h1><p>Overdue work appears first. Filter live records by workflow, category, or date.</p></div></div><div className="tabs">{statuses.map(value=><button className={status===value?'selected':''} onClick={()=>setStatus(value)} key={value}>{value==='All'?'All reports':value.replace('_',' ')}</button>)}</div><section className="card filter-bar"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(value=><option key={value}>{value}</option>)}</select></label><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><button className="secondary" onClick={()=>{setCategory('All');setFrom('');setTo('');}}>Clear filters</button></section>{error&&<p className="red" style={{margin:'14px 0'}}>{error}</p>}<section className="card table-card"><div className="table-head"><span>Complaint</span><span>Status</span><span>Priority</span><span>SLA due</span><span>Action</span></div>{loading?<p className="muted" style={{padding:20}}>Loading complaints…</p>:ordered.map(item=>{const overdue=item.status!=='RESOLVED'&&new Date(item.dueAt).getTime()<Date.now();return <div className={`table-row ${overdue?'overdue-row':''}`} key={item.id}><span><b>{item.displayId}{overdue?' · OVERDUE':''}</b><strong>{item.description}</strong><small>{item.asset?.name || item.category} · {item.building}{item.floor?` · Floor ${item.floor}`:''}</small></span><span className={`pill ${item.status==='OPEN'?'open':item.status==='IN_PROGRESS'?'progress':'resolved'}`}>{item.status.replace('_',' ')}</span><select aria-label={`Priority for ${item.displayId}`} value={item.priority} onChange={e=>changePriority(item.id,e.target.value as Priority)}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select><span className={overdue?'red':''}>{overdue?'Overdue · ':''}{new Date(item.dueAt).toLocaleString()}</span><span>{item.status!=='RESOLVED'&&<button className="text-btn" onClick={()=>changeStatus(item.id,item.status==='OPEN'?'IN_PROGRESS':'RESOLVED')}>{item.status==='OPEN'?'Start work':'Resolve'}</button>}</span></div>})}{!loading&&!ordered.length&&<p className="muted" style={{padding:20}}>No complaints match these filters.</p>}</section></div>;
}
