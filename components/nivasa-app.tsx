'use client';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, Building2, ChevronRight, CircleHelp, ClipboardPlus, Clock3, Command, FileText, Grid2X2, Home, LayoutDashboard, MapPin, Menu, Plus, QrCode, Search, Settings, ShieldCheck, Sparkles, Wrench, X } from 'lucide-react';
import { complaints, activity, reasons, type Complaint, type Status } from '@/lib/society-data';
import LiveComplaints from '@/components/live-complaints';
import PersistentIntake from '@/components/persistent-intake';
import LiveNotices from '@/components/live-notices';
import LiveDashboardStats from '@/components/live-dashboard-stats';
import LiveAssets from '@/components/live-assets';
import LiveIncidents from '@/components/live-incidents';
import LiveResidentComplaints from '@/components/live-resident-complaints';
import LiveIntelligence from '@/components/live-intelligence';
import CommandPalette from '@/components/command-palette';
import InviteManager from '@/components/invite-manager';

const statusClass: Record<Status,string> = { OPEN:'open', IN_PROGRESS:'progress', RESOLVED:'resolved' };
const nav = [{label:'Command center',icon:LayoutDashboard},{label:'Complaints',icon:FileText},{label:'Incidents',icon:AlertTriangle},{label:'Assets',icon:Building2},{label:'Intelligence',icon:Sparkles},{label:'Notice board',icon:Bell}];
function Pill({children, kind}:{children:React.ReactNode;kind:string}) { return <span className={'pill '+kind}>{children}</span> }
function Sparkline(){return <svg viewBox="0 0 430 120" className="spark"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#4f7e78" stopOpacity=".2"/><stop offset="1" stopColor="#4f7e78" stopOpacity="0"/></linearGradient></defs><path d="M0 91 C26 76 29 85 51 68 S76 78 98 62 S123 69 149 47 S178 59 199 35 S227 50 253 23 S284 39 311 17 S346 29 370 12 S404 25 430 6 V120 H0Z" fill="url(#area)"/><path d="M0 91 C26 76 29 85 51 68 S76 78 98 62 S123 69 149 47 S178 59 199 35 S227 50 253 23 S284 39 311 17 S346 29 370 12 S404 25 430 6" fill="none" stroke="#4f7e78" strokeWidth="3"/></svg>}
function Card({children,className='' }:{children:React.ReactNode;className?:string}) {return <section className={'card '+className}>{children}</section>}

const initialNotifications = [
  { id: '1', title: 'Water supply notice posted', sub: 'Cleaning overhead tank on Sunday 11 AM - 1 PM', time: '10m ago', unread: true, type: 'notice' },
  { id: '2', title: 'Tower B Lift 2 status updated', sub: 'Vendor assigned and inspection is underway', time: '1h ago', unread: true, type: 'complaint' },
  { id: '3', title: 'Critical SLA Risk Alert', sub: 'INC-2026-00042 reached 76% SLA consumption', time: '2h ago', unread: true, type: 'incident' },
  { id: '4', title: 'Preventive maintenance complete', sub: 'Generator 1 monthly inspection verified', time: '1d ago', unread: false, type: 'asset' }
];

export default function NivasaApp({initialView='dashboard',resident=false}:{initialView?:string;resident?:boolean}) {
 const [view,setView]=useState(initialView), [query,setQuery]=useState(''), [filter,setFilter]=useState('All'), [selected,setSelected]=useState<Complaint|null>(null), [create,setCreate]=useState(false), [step,setStep]=useState(1), [toast,setToast]=useState(''), [palette,setPalette]=useState(false);
 const [notifOpen, setNotifOpen] = useState(false);
 const [items, setItems] = useState(initialNotifications);

 const unreadCount = useMemo(() => items.filter(i => i.unread).length, [items]);

 useEffect(() => {
   fetch('/api/notifications')
     .then(r => r.ok ? r.json() : null)
     .then(data => {
       if (data?.items?.length) {
         setItems(data.items.map((n: any) => ({
           id: n.id,
           title: n.type.replace(/_/g, ' '),
           sub: n.error || `Notification for ${n.entityType} ${n.entityId}`,
           time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           unread: n.status === 'PENDING',
           type: n.entityType.toLowerCase()
         })));
       }
     })
     .catch(() => {});
 }, []);

 const markAllRead = () => {
   setItems(prev => prev.map(i => ({ ...i, unread: false })));
   notify('All notifications marked as read');
 };

 const filtered=useMemo(()=>complaints.filter(c=>(filter==='All'||c.status===filter)&&(`${c.id} ${c.title} ${c.asset}`.toLowerCase().includes(query.toLowerCase()))),[filter,query]);
 const notify=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2800)};
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setPalette(true)}if(event.key==='Escape'){setPalette(false);setNotifOpen(false)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[]);
 if (create) return <PersistentIntake close={()=>setCreate(false)} done={notify}/>;
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/dashboard">
          <span className="brand-mark"><Home size={19}/></span>
          <span>Nivasa <b>Pulse</b><small>OPERATIONS</small></span>
        </a>
        <div className="society">
          <span className="avatar">SH</span>
          <span>Skyline Heights<small>Society workspace</small></span>
          <ChevronRight size={15}/>
        </div>
        <nav>
          {nav.map(({label,icon:Icon}) => (
            <button
              key={label}
              className={(view===label.toLowerCase().split(' ')[0]||(view==='dashboard'&&label==='Command center'))?'active':''}
              onClick={()=>setView(label==='Command center'?'dashboard':label.toLowerCase().split(' ')[0])}
            >
              <Icon size={17}/>
              {label}
              {label==='Incidents'&&<em>3</em>}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          {!resident && <button onClick={()=>setView('settings')}><Settings size={17}/>Settings</button>}
          <div className="profile">
            <span className="avatar dark">SS</span>
            <span>Shubham Sen<small>{resident?'Resident · B-402':'Facilities Manager'}</small></span>
            <ChevronRight size={14}/>
          </div>
        </div>
      </aside>
      <div className="content">
        <header style={{position:'relative'}}>
          <button className="mobile-menu"><Menu/></button>
          <button className="search" onClick={()=>setPalette(true)}>
            <Search size={18}/>
            <span>Search complaints, incidents, assets...</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="header-actions">
            <button className="icon-btn" onClick={()=>setNotifOpen(!notifOpen)} title="Notifications">
              <Bell size={19}/>
              {unreadCount > 0 && <i/>}
            </button>
            <button className="help"><CircleHelp size={18}/> Help</button>
            <button className="primary" onClick={()=>setCreate(true)}><Plus size={18}/>Raise a complaint</button>
          </div>
          {notifOpen && (
            <div className="notification-popover">
              <div className="notification-popover-header">
                <h3><Bell size={16}/> Notifications {unreadCount>0 && <Pill kind="high">{unreadCount} new</Pill>}</h3>
                <button className="close" style={{position:'static'}} onClick={()=>setNotifOpen(false)}><X size={16}/></button>
              </div>
              <div className="notification-popover-body">
                {items.map(item => (
                  <button
                    key={item.id}
                    className={`notification-item ${item.unread?'unread':''}`}
                    onClick={() => {
                      setItems(prev => prev.map(i => i.id === item.id ? {...i, unread: false} : i));
                      if (item.type === 'notice') setView('notice');
                      else if (item.type === 'incident') setView('incidents');
                      else setView('complaints');
                      setNotifOpen(false);
                    }}
                  >
                    <span className="notification-item-icon">
                      {item.type === 'notice' ? <Bell size={16}/> : item.type === 'incident' ? <AlertTriangle size={16}/> : <FileText size={16}/>}
                    </span>
                    <div className="notification-item-content">
                      <div className="notification-item-title">{item.title}</div>
                      <div className="notification-item-sub">{item.sub}</div>
                      <small style={{marginTop:'4px',fontSize:'9px',color:'#889995'}}>{item.time}</small>
                    </div>
                  </button>
                ))}
                {!items.length && <p style={{padding:'20px',textAlign:'center',color:'#778885'}}>No new notifications.</p>}
              </div>
              <div className="notification-popover-footer">
                <button className="text-btn" onClick={markAllRead}>Mark all read</button>
                <button className="text-btn" onClick={() => { setView('notice'); setNotifOpen(false); }}>View notice board →</button>
              </div>
            </div>
          )}
        </header>
        {view==='dashboard' && <Dashboard open={setSelected} resident={resident} />}
        {view==='complaints' && <LiveComplaints/>} 
        {view==='incidents' && <LiveIncidents/>}
        {view==='assets' && <LiveAssets/>}
        {view==='intelligence' && <LiveIntelligence/>}
        {view==='notice' && <LiveNotices admin={!resident}/>} 
        {view==='settings' && !resident && <InviteManager/>}
      </div>
      <CommandPalette open={palette} onClose={()=>setPalette(false)} onCreate={()=>setCreate(true)} onView={setView}/>
      {selected && <Detail item={selected} close={()=>setSelected(null)} notify={notify}/>}
      {toast && <div className="toast"><ShieldCheck size={18}/>{toast}</div>}
    </main>
  );
}

function Dashboard({open,resident}:{open:(c:Complaint)=>void;resident:boolean}) { if(resident) return <ResidentDashboard open={open}/>; return <div className="page"><div className="eyebrow">OPERATIONS OVERVIEW · THURSDAY, AUGUST 22</div><div className="heading-row"><div><h1>Good morning, Shubham.</h1><p>Here’s the maintenance pulse across Skyline Heights.</p></div><button className="secondary"><Clock3 size={16}/>Last updated just now</button></div><LiveDashboardStats/><div className="grid main-grid"><Card className="attention"><div className="card-title"><div><span className="section-label alert">ATTENTION REQUIRED</span><h2>Incidents needing a decision</h2></div><button className="text-btn">View risk radar <ChevronRight size={16}/></button></div><IncidentRow open={open}/><IncidentRow open={open} second/><IncidentRow open={open} third/></Card><Card className="health"><div className="section-label">SOCIETY HEALTH</div><div className="score"><strong>82</strong><span>/ 100<br/><b>Good</b></span></div><p>Up 7 points from the previous 30 days.</p><div className="meter"><i style={{width:'82%'}}/></div><button className="text-btn">How it’s calculated <ChevronRight size={15}/></button></Card></div><div className="grid lower-grid"><Card><div className="card-title"><div><span className="section-label">COMPLAINT TREND</span><h2>Volume is up 14%</h2></div><span className="muted">Last 30 days</span></div><Sparkline/><div className="chart-labels"><span>Jul 24</span><span>Aug 01</span><span>Aug 08</span><span>Aug 15</span><span>Today</span></div></Card><Card><div className="card-title"><div><span className="section-label">MAINTENANCE HEATMAP</span><h2>Active issues by location</h2></div><button className="text-btn">Explore <ChevronRight size={15}/></button></div><div className="heatmap"><div><b>Tower B</b><span>1</span><span>0</span><span className="heat low">2</span><span className="heat hot">7</span><span className="heat med">4</span><span>1</span></div><div><b>Tower C</b><span>0</span><span>1</span><span className="heat med">3</span><span className="heat hot">5</span><span className="heat low">2</span><span>0</span></div><small>Floors 9 → 4 &nbsp; · &nbsp; Click an area to filter</small></div></Card><Card><div className="card-title"><div><span className="section-label">RECENT ACTIVITY</span><h2>Resolution trail</h2></div><button className="text-btn">All activity</button></div><div className="activity">{activity.map(a=><div key={a[0]}><i/><span><b>{a[1]}</b> {a[2]}<small>{a[3]}</small></span></div>)}</div></Card></div></div> }
function Kpi({label,value,delta,icon,warn,danger}:{label:string;value:string;delta:string;icon:React.ReactNode;warn?:boolean;danger?:boolean}){return <Card className={'kpi '+(warn?'warn ':'')+(danger?'danger':'')}><span className="kpi-icon">{icon}</span><span className="section-label">{label}</span><strong>{value}</strong><small>{delta}</small></Card>}
function IncidentRow({open,second,third}:{open:(c:Complaint)=>void;second?:boolean;third?:boolean}){ const c=second?complaints[2]:third?complaints[3]:complaints[0];return <button className="incident-row" onClick={()=>open(c)}><span className={'risk-dot '+(c.risk>80?'critical':'high')}>{c.risk}</span><span className="incident-copy"><b>{c.incident||c.id} · {c.title}</b><small><MapPin size={13}/>{c.location} <span>·</span> {c.residents} residents affected <span>·</span> {c.asset}</small></span><Pill kind={c.priority==='HIGH'?'high':'medium'}>{c.priority}</Pill><span className={c.due.includes('Overdue')?'due bad':'due'}>{c.due}<small>{c.risk>80?'Critical':'High'} risk</small></span><ChevronRight size={18}/></button>}
function Complaints({data,filter,setFilter,open}:{data:Complaint[];filter:string;setFilter:(s:string)=>void;open:(c:Complaint)=>void}){return <div className="page"><div className="eyebrow">COMPLAINT MANAGEMENT</div><div className="heading-row"><div><h1>All complaints</h1><p>Track, triage and resolve every resident report.</p></div><button className="secondary"><Settings size={16}/>Filters</button></div><div className="tabs">{['All','OPEN','IN_PROGRESS','RESOLVED'].map(t=><button className={filter===t?'selected':''} onClick={()=>setFilter(t)} key={t}>{t==='All'?'All reports':t.replace('_',' ')}</button>)}</div><Card className="table-card"><div className="table-head"><span>Complaint</span><span>Status</span><span>Priority</span><span>SLA</span><span>Risk</span></div>{data.map(c=><button className="table-row" key={c.id} onClick={()=>open(c)}><span><b>{c.id}</b><strong>{c.title}</strong><small>{c.asset} · {c.location}</small></span><Pill kind={statusClass[c.status]}>{c.status.replace('_',' ')}</Pill><Pill kind={c.priority==='HIGH'?'high':c.priority==='MEDIUM'?'medium':'low'}>{c.priority}</Pill><span className={c.due.includes('Overdue')?'red':''}>{c.due}</span><span className="risk-number">{c.risk}<i style={{width:c.risk+'%'}}/></span></button>)}</Card></div>}
function Incidents({open}:{open:(c:Complaint)=>void}){return <div className="page"><div className="eyebrow">INCIDENT FUSION</div><div className="heading-row"><div><h1>Underlying incidents</h1><p>Several reports can represent one real maintenance problem.</p></div><button className="secondary"><Sparkles size={16}/>How matching works</button></div><Card className="fusion"><div className="fusion-top"><span className="incident-id">INC-2026-00042</span><Pill kind="high">HIGH PRIORITY</Pill><Pill kind="critical">CRITICAL · 84</Pill></div><h2>Tower B Lift 2 — Intermittent Failure</h2><p><MapPin size={15}/> Tower B · Lift lobby &nbsp; <span>·</span> Asset: <b>Tower B Lift 2</b></p><div className="fusion-stats"><div><strong>4</strong><small>Residents affected</small></div><div><strong>76%</strong><small>SLA consumed</small></div><div><strong>3</strong><small>Failures / 30d</small></div><div><strong>2h 14m</strong><small>Until breach</small></div></div><div className="match-note"><Sparkles size={17}/><span><b>Incident Fusion found 3 related reports.</b> Suggested because they share asset, category, meaningful text overlap and were reported within 2 hours.</span><button onClick={()=>open(complaints[0])}>Inspect match <ChevronRight size={15}/></button></div></Card><div className="grid lower-grid"><Card><span className="section-label">RISK EXPLAINABILITY</span><h2>Why this is critical</h2><ul className="reasons">{reasons.map(r=><li key={r}><AlertTriangle size={15}/>{r}</li>)}</ul><small className="muted">Transparent operational score — not an ML prediction.</small></Card><Card><span className="section-label">FOLLOWERS</span><h2>Updates reach 4 residents</h2><div className="faces"><i>MR</i><i>AK</i><i>DV</i><i>+1</i></div><p className="muted">They will receive in-app and email status updates.</p></Card></div></div>}
function Assets(){return <div className="page"><div className="eyebrow">ASSET PASSPORTS</div><div className="heading-row"><div><h1>Society assets</h1><p>Every critical asset has a maintenance passport and report QR.</p></div><button className="primary"><QrCode size={17}/>Print QR sheets</button></div><div className="asset-grid">{[['Tower B Lift 2','Elevator','Critical',84,'AST-LIFT-B2'],['Main Water Pump','Plumbing','At risk',58,'AST-PUMP-01'],['Generator 1','Electrical','Healthy',22,'AST-GEN-01'],['Basement CCTV Zone','Security','At risk',68,'AST-CCTV-B']].map(([name,category,state,risk,id])=><Card className="asset" key={String(id)}><div className="asset-top"><span className="asset-icon"><Building2 size={21}/></span><QrCode size={22}/></div><span className="section-label">{String(id)}</span><h2>{String(name)}</h2><p>{String(category)} · Skyline Heights</p><div className="asset-bottom"><span>Health <b>{risk as number}/100</b></span><Pill kind={String(state)==='Critical'?'critical':String(state)==='Healthy'?'resolved':'medium'}>{String(state)}</Pill></div></Card>)}</div></div>}
function Intelligence(){return <div className="page"><div className="eyebrow">MAINTENANCE INTELLIGENCE</div><div className="heading-row"><div><h1>Patterns worth acting on</h1><p>Operational indicators built from actual maintenance activity.</p></div><button className="secondary">Last 30 days</button></div><div className="intel-grid"><Card><span className="section-label">REPEATED ASSETS</span><h2>Tower B Lift 2</h2><strong className="big-number">11 <small>complaints</small></strong><p>Across 4 incidents in the last 30 days.</p><div className="meter"><i style={{width:'81%'}}/></div></Card><Card><span className="section-label">FIRST-TIME FIX RATE</span><strong className="big-number">78<small>%</small></strong><p>Resolved incidents that were not reopened.</p><div className="meter"><i style={{width:'78%'}}/></div></Card><Card><span className="section-label">MEDIAN RESOLUTION</span><strong className="big-number">18.4<small>h</small></strong><p>Electrical is improving; plumbing needs attention.</p><div className="meter orange"><i style={{width:'56%'}}/></div></Card></div><Card className="recurrence"><div><span className="section-label">REPEAT LOCATIONS</span><h2>Tower C floors 7–9</h2><p>Water-pressure and leakage reports cluster here. Inspect the shared riser before the next peak period.</p></div><button className="primary">View related complaints</button></Card></div>}
function Notices(){return <div className="page"><div className="eyebrow">SOCIETY NOTICE BOARD</div><div className="heading-row"><div><h1>Keep residents informed</h1><p>Important updates are pinned and delivered once, reliably.</p></div><button className="primary"><Plus size={17}/>Create notice</button></div><Card className="notice important"><Pill kind="critical">IMPORTANT · PINNED</Pill><h2>Water supply interruption — Tower B</h2><p>Cleaning of the overhead tank will pause water supply in Tower B from 11 AM to 1 PM this Sunday. Please plan accordingly.</p><small>Posted by Facilities team · Aug 21 · Email sent to 84 residents</small></Card><Card className="notice"><Pill kind="low">MAINTENANCE</Pill><h2>Lift maintenance — Sunday 10 AM–1 PM</h2><p>Lift A1 will receive its scheduled preventive service. Lift A2 remains available.</p><small>Posted by Facilities team · Aug 20</small></Card></div>}
function Detail({item,close,notify}:{item:Complaint;close:()=>void;notify:(m:string)=>void}){const [status,setStatus]=useState(item.status);return <div className="drawer-wrap"><div className="drawer-backdrop" onClick={close}/><aside className="drawer"><button className="close" onClick={close}><X/></button><span className="section-label">{item.id}</span><h2>{item.title}</h2><div className="detail-pills"><Pill kind={statusClass[status]}>{status.replace('_',' ')}</Pill><Pill kind={item.priority==='HIGH'?'high':'medium'}>{item.priority}</Pill></div><div className="detail-meta"><span><MapPin size={15}/>{item.location}</span><span><Building2 size={15}/>{item.asset}</span></div><Card className="detail-risk"><div><span className="section-label">MAINTENANCE RISK</span><strong>{item.risk}<small>/100</small></strong></div><Pill kind={item.risk>80?'critical':'medium'}>{item.risk>80?'CRITICAL':'AT RISK'}</Pill><p>{reasons.slice(0,3).map(x=><span key={x}>• {x}</span>)}</p></Card><div className="timeline"><span className="section-label">IMMUTABLE RESOLUTION TRAIL</span><h3>Status history</h3><div><i className="done"/><span><b>Reported</b><small>Maya Rao · Aug 21, 09:18</small><p>“{item.title}”</p></span></div><div><i className="done"/><span><b>Incident fusion suggested</b><small>Nivasa Pulse · Aug 21, 09:19</small><p>87% match with INC-2026-00042.</p></span></div><div><i className="done"/><span><b>Moved to In progress</b><small>Shubham Sen · Today, 09:42</small><p>Vendor assigned; inspection is underway.</p></span></div>{status==='RESOLVED'&&<div><i className="done"/><span><b>Resolved with proof</b><small>Facilities team · Today</small><p>Door sensor replaced and tested.</p></span></div>}</div><div className="drawer-actions">{status!=='RESOLVED'&&<button className="primary" onClick={()=>{setStatus('RESOLVED');notify('Resolved — history and resident notifications were created.')}}><ShieldCheck size={17}/>Resolve with proof</button>}<button className="secondary" onClick={()=>notify('Priority update saved with an audit event.')}>Change priority</button></div></aside></div>}
function Intake({close,step,setStep,done}:{close:()=>void;step:number;setStep:(n:number)=>void;done:()=>void}){return <main className="intake"><header className="intake-header"><a className="brand" href="/dashboard"><span className="brand-mark"><Home size={19}/></span><span>Nivasa <b>Pulse</b><small>SKYLINE HEIGHTS</small></span></a><button className="secondary" onClick={close}>Save & exit</button></header><div className="intake-body"><span className="eyebrow">RAISE A COMPLAINT</span><h1>Let’s get this sorted.</h1><p>Clear details help the right team act faster.</p><div className="steps"><span className={step>=1?'current':''}>1 <b>What happened?</b></span><i/><span className={step>=2?'current':''}>2 <b>Smart analysis</b></span><i/><span className={step>=3?'current':''}>3 <b>Confirm</b></span></div>{step===1&&<div className="form-card"><label>What needs attention?<select defaultValue="Elevator"><option>Elevator</option><option>Plumbing</option><option>Electrical</option><option>Security</option></select></label><label>Describe the issue<textarea defaultValue="Lift keeps getting stuck between floors and the doors are slow to close."/></label><div className="form-grid"><label>Building / wing<select defaultValue="Tower B"><option>Tower B</option><option>Tower A</option><option>Tower C</option></select></label><label>Floor<select defaultValue="4"><option>4</option><option>3</option><option>2</option></select></label></div><label>Asset (optional)<select defaultValue="Tower B Lift 2"><option>Tower B Lift 2</option><option>No specific asset</option></select></label><div className="upload">+ Add a photo <small>JPG, PNG or WebP · Max 5 MB</small></div><button className="primary wide" onClick={()=>setStep(2)}>Continue to analysis <ChevronRight size={17}/></button></div>}{step===2&&<div className="analysis-card"><div className="analysis-title"><span><Sparkles size={20}/></span><div><b>System analysis</b><small>Suggestions only — you stay in control.</small></div></div><div className="analysis-grid"><div><small>Likely category</small><b>Elevator</b></div><div><small>Suggested urgency</small><Pill kind="high">HIGH</Pill></div><div><small>Affected area</small><b>Tower B</b></div></div><div className="duplicate"><AlertTriangle size={18}/><div><b>Possible existing incident · 87% match</b><p>Tower B Lift 2 — Intermittent Failure</p><small>Same category + asset + similar description + reported within 2 hours.</small></div></div><button className="secondary wide" onClick={()=>setStep(3)}>Continue with a separate complaint <ChevronRight size={17}/></button><button className="text-btn wide">Join/follow existing incident</button></div>}{step===3&&<div className="form-card review"><span className="section-label">REVIEW BEFORE SENDING</span><h2>Lift keeps getting stuck between floors</h2><p>Elevator · Tower B · Floor 4 · Tower B Lift 2</p><hr/><p>Your report will be linked to relevant incidents if you choose, while retaining its own transparent history.</p><button className="primary wide" onClick={done}><ClipboardPlus size={17}/>Submit complaint</button></div>}</div></main>}
function ResidentDashboard({open}:{open:(c:Complaint)=>void}){return <div className="page resident"><div className="eyebrow">SKYLINE HEIGHTS · B-402</div><div className="heading-row"><div><h1>Good evening, Maya.</h1><p>Here’s what’s happening in your community.</p></div><a className="primary" href="#" onClick={e=>e.preventDefault()}><Plus size={17}/>Raise a complaint</a></div><div className="grid main-grid"><LiveResidentComplaints/><Card className="health"><span className="section-label">SOCIETY HEALTH</span><div className="score"><strong>82</strong><span>/ 100<br/><b>Good</b></span></div><p>Maintenance is trending healthier this month.</p></Card></div><Card className="notice important"><Pill kind="critical">IMPORTANT</Pill><h2>Water supply interruption — Tower B</h2><p>Water supply will pause from 11 AM–1 PM this Sunday for overhead tank cleaning.</p></Card></div>}
