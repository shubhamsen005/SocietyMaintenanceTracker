'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { Suspense, useState } from 'react';

export default function Login(){return <Suspense fallback={null}><LoginForm/></Suspense>}
function LoginForm(){
  const router=useRouter(),params=useSearchParams();
  const [email,setEmail]=useState(''),[password,setPassword]=useState('nivasa2026'),[error,setError]=useState(''),[loading,setLoading]=useState(false);
  const next=params.get('next');
  const destination=(role:string)=>next&&next.startsWith('/report/asset/')?next:(role==='RESIDENT'?'/resident':'/dashboard');
  const signIn=async(address=email,secret=password)=>{
    setError(''); setLoading(true);
    try { const result=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:address.trim(),password:secret})});
      if(!result.ok){setError('We couldn’t sign you in. Check your email and password, then try again.');return;}
      const data=await result.json(); router.replace(destination(data.user.role)); router.refresh();
    } catch { setError('Network issue — please try again.'); } finally { setLoading(false); }
  };
  return <main className="login"><section className="login-copy"><a className="brand"><span className="brand-mark"><Home size={19}/></span><span>Nivasa <b>Pulse</b><small>OPERATIONS</small></span></a><div><span className="eyebrow">SOCIETY MAINTENANCE, REIMAGINED</span><h1>From complaints to <em>community intelligence.</em></h1><p>Turn resident reports into faster, more transparent maintenance decisions.</p><div className="login-feature"><Sparkles size={19}/><span><b>Incident Fusion</b><small>See the underlying issue, not just the tickets.</small></span></div><div className="login-feature"><LockKeyhole size={19}/><span><b>Resolution you can trust</b><small>Every update has an accountable audit trail.</small></span></div></div><small>© 2026 Nivasa Pulse · Built for better communities</small></section><section className="login-form"><div><span className="section-label">WELCOME BACK</span><h2>Sign in to your workspace</h2><p>Use your society account to continue.</p><label>Email address<div className="input"><Mail size={17}/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@skylineheights.in" autoComplete="email"/></div></label><label>Password<div className="input"><LockKeyhole size={17}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></div></label>{error&&<p className="red" role="alert">{error}</p>}<button className="primary wide" disabled={loading} onClick={()=>signIn()}>{loading?'Signing in…':'Sign in'}</button><div className="or"><span/>or continue<span/></div><div className="access-buttons"><button disabled={loading} onClick={()=>signIn('admin@nivasa.pulse','nivasa2026')}>Continue as Admin<small>admin@nivasa.pulse</small></button><button disabled={loading} onClick={()=>signIn('resident@nivasa.pulse','nivasa2026')}>Continue as Resident<small>resident@nivasa.pulse</small></button></div><p className="signin-note">Access password: <code>nivasa2026</code></p></div></section></main>
}
