import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreFusion } from '../lib/fusion';
test('Incident Fusion does not overstate unrelated reports',()=>{const result=scoreFusion({category:'Plumbing',building:'Tower A',description:'Kitchen sink leakage',openedAt:new Date('2026-08-01T09:00:00Z')},{category:'Security',building:'Tower C',description:'CCTV camera is offline',openedAt:new Date('2026-08-03T09:00:00Z')});assert.ok(result.confidence<45);assert.equal(result.reasons.length,0);});
