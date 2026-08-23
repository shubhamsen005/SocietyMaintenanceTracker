import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreFusion } from '../lib/fusion';

test('Incident Fusion ranks same-asset lift reports as a high-confidence match',()=>{const score=scoreFusion({category:'Elevator',building:'Tower B',assetId:'lift-b2',description:'Lift keeps getting stuck between floors',openedAt:new Date('2026-08-22T09:00:00Z')},{category:'Elevator',building:'Tower B',assetId:'lift-b2',description:'B block elevator stopped again',openedAt:new Date('2026-08-22T10:00:00Z')});assert.ok(score.confidence>=80);assert.ok(score.reasons.includes('Same asset'));});
