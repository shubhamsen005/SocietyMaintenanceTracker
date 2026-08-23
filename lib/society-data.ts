export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Complaint = { id:string; title:string; category:string; status:Status; priority:Priority; asset:string; location:string; created:string; due:string; residents:number; risk:number; incident?:string };
export const complaints: Complaint[] = [
 { id:'CMP-2026-00124', title:'Lift keeps getting stuck between floors', category:'Elevator', status:'IN_PROGRESS', priority:'HIGH', asset:'Tower B Lift 2', location:'Tower B · Floor 4', created:'Aug 21, 09:18', due:'2h 14m remaining', residents:4, risk:84, incident:'INC-2026-00042' },
 { id:'CMP-2026-00125', title:'B block elevator stopped again', category:'Elevator', status:'OPEN', priority:'HIGH', asset:'Tower B Lift 2', location:'Tower B · Floor 2', created:'Aug 21, 10:02', due:'2h 58m remaining', residents:4, risk:84, incident:'INC-2026-00042' },
 { id:'CMP-2026-00119', title:'Water seepage below kitchen sink', category:'Plumbing', status:'OPEN', priority:'HIGH', asset:'Tower C water riser', location:'Tower C · Floor 8', created:'Aug 20, 07:18', due:'Overdue by 5h', residents:2, risk:76 },
 { id:'CMP-2026-00112', title:'Basement camera is offline', category:'Security', status:'OPEN', priority:'MEDIUM', asset:'Basement CCTV Zone', location:'Basement · Zone 3', created:'Aug 19, 16:30', due:'Overdue by 1d 3h', residents:1, risk:68 },
 { id:'CMP-2026-00106', title:'Generator servicing follow-up', category:'Electrical', status:'RESOLVED', priority:'MEDIUM', asset:'Generator 1', location:'Service yard', created:'Aug 18, 13:20', due:'Resolved', residents:1, risk:12 },
];
export const activity = [
 ['09:42','Aarav Mehta','moved INC-2026-00042 to In progress','Just now'],
 ['09:18','Maya Rao','reported a lift fault at Tower B','24 min ago'],
 ['Yesterday · 15:26','Facilities team','uploaded resolution proof for Generator 1','1d ago'],
 ['Yesterday · 08:10','Nivasa Pulse','flagged Tower C plumbing as SLA risk','1d ago'],
];
export const reasons = ['High-priority issue','4 residents affected','76% of SLA window consumed','Lift B2 failed 3 times in 30 days'];
