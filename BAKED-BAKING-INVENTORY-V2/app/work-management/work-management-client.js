'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'baked-work-management-v1';
const initialData = { boardName:'BAKED Operations Board', groups:[{id:'g1',name:'This Week',items:[{id:'i1',task:'Example task',owner:'Unassigned',status:'Working on it',priority:'Medium',dueDate:'',note:'',done:false,updates:[]}]}]};
const statuses=['Not Started','Working on it','Stuck','Done'];
const priorities=['Low','Medium','High','Urgent'];
function uid(prefix='id'){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;}
function slug(v=''){return String(v).toLowerCase().replaceAll(' ','-');}

export default function WorkManagementClient(){
 const [data,setData]=useState(initialData),[view,setView]=useState('table'),[query,setQuery]=useState(''),[selectedItem,setSelectedItem]=useState(null),[loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)setData(JSON.parse(raw));}catch{} setLoaded(true)},[]);
 useEffect(()=>{if(loaded)localStorage.setItem(STORAGE_KEY,JSON.stringify(data))},[data,loaded]);
 const updateItem=(gid,iid,c)=>setData(d=>({...d,groups:d.groups.map(g=>g.id===gid?{...g,items:g.items.map(i=>i.id===iid?{...i,...c}:i)}:g)}));
 const addItem=gid=>setData(d=>({...d,groups:d.groups.map(g=>g.id===gid?{...g,items:[...g.items,{id:uid('i'),task:'New item',owner:'Unassigned',status:'Not Started',priority:'Medium',dueDate:'',note:'',done:false,updates:[]}]}:g)}));
 const addGroup=()=>setData(d=>({...d,groups:[...d.groups,{id:uid('g'),name:'New Group',items:[]}]}));
 const allItems=useMemo(()=>data.groups.flatMap(g=>g.items.map(i=>({...i,groupId:g.id,groupName:g.name}))),[data.groups]);
 const groups=useMemo(()=>{const q=query.toLowerCase().trim();return !q?data.groups:data.groups.map(g=>({...g,items:g.items.filter(i=>[i.task,i.owner,i.status,i.priority,i.note].some(v=>String(v||'').toLowerCase().includes(q)))})).filter(g=>g.items.length)},[data.groups,query]);
 return <div className="monday-shell">
  <header className="monday-top"><div><div className="eyebrow">BAKED INVENTORY</div><input className="board-title-input" value={data.boardName} onChange={e=>setData({...data,boardName:e.target.value})}/><div className="board-subtitle">Work Management</div></div><div className="top-actions"><button className={view==='table'?'active':''} onClick={()=>setView('table')}>Table</button><button className={view==='kanban'?'active':''} onClick={()=>setView('kanban')}>Kanban</button></div></header>
  <section className="summary-row"><div className="summary-card"><span>Total Items</span><strong>{allItems.length}</strong></div><div className="summary-card"><span>Working</span><strong>{allItems.filter(i=>i.status==='Working on it').length}</strong></div><div className="summary-card"><span>Stuck</span><strong>{allItems.filter(i=>i.status==='Stuck').length}</strong></div><div className="summary-card"><span>Done</span><strong>{allItems.filter(i=>i.status==='Done').length}</strong></div></section>
  <div className="toolbar"><button className="primary" onClick={addGroup}>+ New Group</button><input placeholder="Search board..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
  {view==='table'?<div>{groups.map(g=><section className="group-block" key={g.id}><div className="group-head"><input value={g.name} onChange={e=>setData(d=>({...d,groups:d.groups.map(x=>x.id===g.id?{...x,name:e.target.value}:x)}))}/></div><div className="board-table-wrap"><table className="board-table"><thead><tr><th>Item</th><th>Owner</th><th>Status</th><th>Priority</th><th>Due Date</th><th>Notes</th></tr></thead><tbody>{g.items.map(i=><tr key={i.id}><td><input className="item-name" value={i.task} onChange={e=>updateItem(g.id,i.id,{task:e.target.value})}/></td><td><input value={i.owner} onChange={e=>updateItem(g.id,i.id,{owner:e.target.value})}/></td><td><select className={`status-${slug(i.status)}`} value={i.status} onChange={e=>updateItem(g.id,i.id,{status:e.target.value})}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td><td><select value={i.priority} onChange={e=>updateItem(g.id,i.id,{priority:e.target.value})}>{priorities.map(p=><option key={p}>{p}</option>)}</select></td><td><input type="date" value={i.dueDate} onChange={e=>updateItem(g.id,i.id,{dueDate:e.target.value})}/></td><td><input value={i.note} onChange={e=>updateItem(g.id,i.id,{note:e.target.value})}/></td></tr>)}<tr className="add-row"><td colSpan="6"><button onClick={()=>addItem(g.id)}>+ Add Item</button></td></tr></tbody></table></div></section>)}</div>:<div className="kanban-grid">{statuses.map(s=><div className="kanban-col" key={s}><div className={`kanban-title status-${slug(s)}`}><span>{s}</span><strong>{allItems.filter(i=>i.status===s).length}</strong></div>{allItems.filter(i=>i.status===s).map(i=><div className="kanban-card" key={i.id}><strong>{i.task}</strong><span>{i.groupName}</span><span>{i.owner}</span><span>{i.priority}</span><select value={i.status} onChange={e=>updateItem(i.groupId,i.id,{status:e.target.value})}>{statuses.map(x=><option key={x}>{x}</option>)}</select></div>)}</div>)}</div>}
 </div>
}
