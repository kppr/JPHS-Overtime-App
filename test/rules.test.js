import test from 'node:test';import assert from 'node:assert/strict';import {calculate,checkCap} from '../src/rules.js';
const p={startDate:'2026-09-23',endDate:'2026-09-23',startTime:'16:00',endTime:'16:29',dayType:'Working day'};
test('30 minute working day threshold',()=>{assert.equal(calculate(p).eligible,0);assert.equal(calculate({...p,endTime:'16:30'}).eligible,30);});
test('six holiday hours equal one paid day',()=>{const r=calculate({...p,startTime:'08:00',endTime:'14:00',dayType:'Holiday'});assert.equal(r.eligible,480);assert.equal(r.paidDays,1);});
test('overnight duration and month boundary',()=>{assert.equal(calculate({...p,startTime:'23:30',endDate:'2026-09-24',endTime:'01:00'}).worked,90);assert.throws(()=>calculate({...p,startDate:'2026-09-30',endDate:'2026-10-01',startTime:'23:30',endTime:'01:00'}));});
test('exactly 80 hours allowed, above blocked',()=>{assert.doesNotThrow(()=>checkCap(4770,30));assert.throws(()=>checkCap(4770,60),/80-hour/);});
