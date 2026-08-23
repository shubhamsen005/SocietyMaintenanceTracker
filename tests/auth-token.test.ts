import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../lib/auth';
import { jwtVerify } from 'jose';
test('session tokens carry identity and role claims',async()=>{const token=await createSession({id:'user-1',societyId:'society-1',role:'ADMIN',name:'Shubham Sen'});const secret=new TextEncoder().encode(process.env.AUTH_SECRET||'development-only-change-me');const payload=(await jwtVerify(token,secret)).payload;assert.equal(payload.id,'user-1');assert.equal(payload.role,'ADMIN');});
