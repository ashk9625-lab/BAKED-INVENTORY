'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const initialData = {
  boardName: 'BAKED Operations Board',
  groups: [
    {
      id: 'g1',
      name: 'This Week',
      items: [
        {
          id: 'i1',
          task: 'Example task',
          owner: 'Unassigned',
          status: 'Working on it',
          priority: 'Medium',
          dueDate: '',
          note: '',
          done: false,
          updates: []
        }
      ]
    }
  ]
};

const statuses = ['Not Started','Working on it','Stuck','Done'];
const priorities = ['Low','Medium','High','Urgent'];

function uid(prefix='id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}

async function jsonFetch(url, options={}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Request failed');
  return body;
}

export default function WorkManagementClient() {
  const [data, setData] = useState(initialData);
  const [view, setView] = useState('table');
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState(null);
  const [liveStatus, setLiveStatus] = useState('Connecting…');
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [lastSeenId, setLastSeenId] = useState(0);
  const localEditRef = useRef(0);
  const savingRef = useRef(false);

  const isManager = ['ADMIN','MANAGER'].includes(String(user?.role || '').toUpperCase());

  async function loadLive({initial=false}={}) {
    try {
      const payload = await jsonFetch('/api/work/live-state');
      setUser(payload.user || null);
      setActivities(payload.activities || []);

      // Do not overwrite a staff member while they are actively typing/saving.
      const recentlyEdited = Date.now() - localEditRef.current < 1800;
      if (payload.data && (!recentlyEdited || initial) && !savingRef.current) {
        setData(payload.data);
      }
      if (!payload.data && initial) {
        await jsonFetch('/api/work/live-state', {
          method:'PUT',
          body:JSON.stringify({data:initialData})
        });
      }
      setLiveStatus('Live');
      if (initial && payload.activities?.length) setLastSeenId(Number(payload.activities[0].id || 0));
    } catch (e) {
      setLiveStatus('Offline');
      console.error(e);
    } finally {
      if (initial) setLoaded(true);
    }
  }

  useEffect(() => {
    loadLive({initial:true});
    const timer = setInterval(() => loadLive(), 5000);
    return () => clearInterval(timer);
  }, []);

  // Shared database save. Changes from any staff device become visible to managers.
  useEffect(() => {
    if (!loaded) return;
    localEditRef.current = Date.now();
    const timer = setTimeout(async () => {
      try {
        savingRef.current = true;
        await jsonFetch('/api/work/live-state', {
          method:'PUT',
          body:JSON.stringify({data})
        });
        setLiveStatus('Live');
      } catch (e) {
        setLiveStatus('Save failed');
        console.error(e);
      } finally {
        savingRef.current = false;
      }
    }, 650);
    return () => clearTimeout(timer);
  }, [data, loaded]);

  function recordActivity(type, message, urgent=false) {
    jsonFetch('/api/work/live-state', {
      method:'POST',
      body:JSON.stringify({type,message,urgent})
    }).then(() => loadLive()).catch(console.error);
  }

  function updateBoardName(value) {
    setData(d => ({...d, boardName:value}));
  }

  function addGroup() {
    const group = {id:uid('g'),name:'New Group',items:[]};
    setData(d => ({...d,groups:[...d.groups,group]}));
    recordActivity('group', 'Created a new work group');
  }

  function renameGroup(groupId, name) {
    setData(d => ({...d,groups:d.groups.map(g => g.id===groupId ? {...g,name} : g)}));
  }

  function deleteGroup(groupId) {
    if (!confirm('Delete this group and all items inside it?')) return;
    const group = data.groups.find(g=>g.id===groupId);
    setData(d => ({...d,groups:d.groups.filter(g=>g.id!==groupId)}));
    recordActivity('group', `Deleted group “${group?.name || 'Group'}”`, true);
  }

  function addItem(groupId) {
    const item = {
      id:uid('i'), task:'New item', owner:'Unassigned', status:'Not Started',
      priority:'Medium', dueDate:'', note:'', done:false, updates:[]
    };
    setData(d => ({...d,groups:d.groups.map(g => g.id===groupId ? {...g,items:[...g.items,item]} : g)}));
    const group = data.groups.find(g=>g.id===groupId);
    recordActivity('task', `Added a new task to ${group?.name || 'Work Management'}`);
  }

  function updateItem(groupId, itemId, changes, activity=null) {
    setData(d => ({
      ...d,
      groups:d.groups.map(g => g.id===groupId
        ? {...g,items:g.items.map(i=>i.id===itemId?{...i,...changes}:i)}
        : g)
    }));
    if (activity) recordActivity(activity.type || 'task', activity.message, !!activity.urgent);
  }

  function deleteItem(groupId,itemId) {
    const item = data.groups.flatMap(g=>g.items).find(i=>i.id===itemId);
    setData(d=>({...d,groups:d.groups.map(g=>g.id===groupId ? {...g,items:g.items.filter(i=>i.id!==itemId)} : g)}));
    if(selectedItem?.id===itemId) setSelectedItem(null);
    recordActivity('task', `Deleted task “${item?.task || 'Task'}”`, true);
  }

  function addUpdate(groupId,itemId,text) {
    const body = String(text||'').trim();
    if(!body) return;
    const update = {id:uid('u'),body,createdAt:new Date().toISOString(),author:user?.name || 'BAKED Staff'};
    const item = data.groups.flatMap(g=>g.items).find(i=>i.id===itemId);
    setData(d=>({...d,groups:d.groups.map(g=>g.id===groupId
      ? {...g,items:g.items.map(i=>i.id===itemId?{...i,updates:[...(i.updates||[]),update]}:i)} : g)}));
    recordActivity('comment', `Posted an update on “${item?.task || 'Task'}”`);
  }

  const visibleGroups = useMemo(() => {
    const q=query.trim().toLowerCase();
    if(!q) return data.groups;
    return data.groups.map(g=>({...g,items:g.items.filter(i =>
      [i.task,i.owner,i.status,i.priority,i.note].some(v=>String(v||'').toLowerCase().includes(q))
    )})).filter(g=>g.items.length);
  },[data.groups,query]);

  const allItems = useMemo(
    ()=>data.groups.flatMap(g=>g.items.map(i=>({...i,groupId:g.id,groupName:g.name}))),
    [data.groups]
  );

  const today = new Date(); today.setHours(0,0,0,0);
  const overdueItems = allItems.filter(i => i.dueDate && i.status !== 'Done' && new Date(`${i.dueDate}T00:00:00`) < today);
  const stuckItems = allItems.filter(i=>i.status==='Stuck');
  const urgentItems = allItems.filter(i=>i.priority==='Urgent' && i.status!=='Done');
  const newActivities = activities.filter(a => Number(a.id) > lastSeenId);
  const alertCount = overdueItems.length + stuckItems.length + urgentItems.length + newActivities.filter(a=>a.urgent).length;

  const counts = useMemo(()=>({
    total:allItems.length,
    done:allItems.filter(i=>i.status==='Done').length,
    working:allItems.filter(i=>i.status==='Working on it').length,
    stuck:allItems.filter(i=>i.status==='Stuck').length
  }),[allItems]);

  function openAlerts() {
    setAlertsOpen(true);
    if (activities.length) setLastSeenId(Number(activities[0].id || 0));
  }

  return <div className="monday-shell">
    <header className="monday-top">
      <div>
        <div className="eyebrow">BAKED INVENTORY</div>
        <input className="board-title-input" value={data.boardName} onChange={e=>updateBoardName(e.target.value)} />
        <div className="board-subtitle">Work Management</div>
      </div>
      <div className="top-actions">
        <span className={`live-indicator ${liveStatus==='Live'?'is-live':''}`}><i></i>{liveStatus}</span>
        {isManager && <button className="alerts-button" onClick={openAlerts}>Alerts {alertCount>0 && <b>{alertCount}</b>}</button>}
        <button onClick={()=>setView('table')} className={view==='table'?'active':''}>Table</button>
        <button onClick={()=>setView('kanban')} className={view==='kanban'?'active':''}>Kanban</button>
      </div>
    </header>

    <section className="summary-row">
      <div className="summary-card"><span>Total Items</span><strong>{counts.total}</strong></div>
      <div className="summary-card"><span>Working</span><strong>{counts.working}</strong></div>
      <div className="summary-card"><span>Stuck</span><strong>{counts.stuck}</strong></div>
      <div className="summary-card"><span>Done</span><strong>{counts.done}</strong></div>
    </section>

    {isManager && <section className="manager-live-card">
      <div className="manager-live-head">
        <div><span className="live-dot"></span><strong>Live Manager Feed</strong><small>Auto-updates every 5 seconds</small></div>
        <button onClick={()=>loadLive()}>Refresh now</button>
      </div>
      <div className="activity-feed">
        {activities.slice(0,8).map(a=><div className={`activity-line ${a.urgent?'urgent':''}`} key={a.id}>
          <time>{new Date(a.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</time>
          <div><strong>{a.actor}</strong><span>{a.message}</span></div>
        </div>)}
        {!activities.length && <p className="muted">Staff activity will appear here as they work.</p>}
      </div>
    </section>}

    <div className="toolbar">
      <button className="primary" onClick={addGroup}>+ New Group</button>
      <input placeholder="Search board..." value={query} onChange={e=>setQuery(e.target.value)} />
    </div>

    {view==='table'
      ? <TableBoard groups={visibleGroups} renameGroup={renameGroup} deleteGroup={deleteGroup} addItem={addItem}
          updateItem={updateItem} deleteItem={deleteItem} setSelectedItem={setSelectedItem} />
      : <KanbanBoard items={allItems} updateItem={updateItem} setSelectedItem={setSelectedItem} />}

    {selectedItem && <UpdatesPanel item={allItems.find(i=>i.id===selectedItem.id) || selectedItem}
      onClose={()=>setSelectedItem(null)} addUpdate={addUpdate} />}

    {alertsOpen && <AlertsPanel overdueItems={overdueItems} stuckItems={stuckItems} urgentItems={urgentItems}
      activities={activities} onClose={()=>setAlertsOpen(false)} />}
  </div>;
}

function TableBoard({groups,renameGroup,deleteGroup,addItem,updateItem,deleteItem,setSelectedItem}) {
  return <div className="board-wrap">
    {groups.map(g=><section className="group-block" key={g.id}>
      <div className="group-head">
        <input value={g.name} onChange={e=>renameGroup(g.id,e.target.value)} />
        <div className="group-head-actions"><span>{g.items.length} items</span><button onClick={()=>deleteGroup(g.id)}>Delete Group</button></div>
      </div>
      <div className="board-table-wrap"><table className="board-table">
        <thead><tr><th className="check-col"></th><th>Item</th><th>Owner</th><th>Status</th><th>Priority</th><th>Due Date</th><th>Notes</th><th>Updates</th><th></th></tr></thead>
        <tbody>
          {g.items.map(i=><tr key={i.id}>
            <td><input type="checkbox" checked={!!i.done} onChange={e=>updateItem(g.id,i.id,
              {done:e.target.checked,status:e.target.checked?'Done':i.status},
              e.target.checked?{type:'status',message:`Completed “${i.task}”`}:null)}/></td>
            <td><input className="item-name" value={i.task} onChange={e=>updateItem(g.id,i.id,{task:e.target.value})}/></td>
            <td><input value={i.owner} onChange={e=>updateItem(g.id,i.id,{owner:e.target.value})}/></td>
            <td><select className={`status-pill status-${slug(i.status)}`} value={i.status} onChange={e=>{
              const status=e.target.value;
              updateItem(g.id,i.id,{status,done:status==='Done'},
                {type:'status',message:`Changed “${i.task}” to ${status}`,urgent:status==='Stuck'});
            }}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td>
            <td><select className={`priority-pill priority-${slug(i.priority)}`} value={i.priority} onChange={e=>{
              const priority=e.target.value;
              updateItem(g.id,i.id,{priority}, {type:'priority',message:`Set “${i.task}” priority to ${priority}`,urgent:priority==='Urgent'});
            }}>{priorities.map(p=><option key={p}>{p}</option>)}</select></td>
            <td><input type="date" value={i.dueDate} onChange={e=>updateItem(g.id,i.id,{dueDate:e.target.value})}/></td>
            <td><input value={i.note} onChange={e=>updateItem(g.id,i.id,{note:e.target.value})}/></td>
            <td><button className="updates-btn" onClick={()=>setSelectedItem({...i,groupId:g.id})}>{i.updates?.length||0} updates</button></td>
            <td><button className="icon-btn" onClick={()=>deleteItem(g.id,i.id)}>×</button></td>
          </tr>)}
          <tr className="add-row"><td></td><td colSpan="8"><button onClick={()=>addItem(g.id)}>+ Add Item</button></td></tr>
        </tbody>
      </table></div>
    </section>)}
  </div>;
}

function KanbanBoard({items,updateItem,setSelectedItem}) {
  return <div className="kanban-grid">
    {statuses.map(status=><div className="kanban-col" key={status}>
      <div className={`kanban-title status-${slug(status)}`}><span>{status}</span><strong>{items.filter(i=>i.status===status).length}</strong></div>
      {items.filter(i=>i.status===status).map(i=><div className="kanban-card" key={i.id}>
        <strong onClick={()=>setSelectedItem(i)}>{i.task}</strong><span>{i.groupName}</span><span>{i.owner}</span><span>{i.priority}</span>
        {i.dueDate && <span>Due: {i.dueDate}</span>}
        <select value={i.status} onChange={e=>{
          const next=e.target.value;
          updateItem(i.groupId,i.id,{status:next,done:next==='Done'},
            {type:'status',message:`Changed “${i.task}” to ${next}`,urgent:next==='Stuck'});
        }}>{statuses.map(s=><option key={s}>{s}</option>)}</select>
      </div>)}
    </div>)}
  </div>;
}

function UpdatesPanel({item,onClose,addUpdate}) {
  const [text,setText]=useState('');
  function submit(e){e.preventDefault();addUpdate(item.groupId,item.id,text);setText('');}
  return <div className="updates-overlay" onClick={onClose}><aside className="updates-panel" onClick={e=>e.stopPropagation()}>
    <button className="panel-close" onClick={onClose}>×</button><div className="eyebrow">ITEM UPDATES</div><h2>{item.task}</h2>
    <p className="muted">{item.note || 'No notes yet.'}</p>
    <form onSubmit={submit} className="update-form"><textarea rows="4" placeholder="Write an update..." value={text} onChange={e=>setText(e.target.value)} /><button className="primary">Post Update</button></form>
    <div className="update-list">{(item.updates||[]).slice().reverse().map(u=><div className="update-card" key={u.id}>
      <strong>{u.author || 'BAKED Staff'}</strong><p>{u.body}</p><span>{new Date(u.createdAt).toLocaleString()}</span>
    </div>)}</div>
  </aside></div>;
}

function AlertsPanel({overdueItems,stuckItems,urgentItems,activities,onClose}) {
  return <div className="updates-overlay" onClick={onClose}><aside className="updates-panel alerts-panel" onClick={e=>e.stopPropagation()}>
    <button className="panel-close" onClick={onClose}>×</button><div className="eyebrow">MANAGER ALERTS</div><h2>Attention Required</h2>
    <AlertSection title="Stuck tasks" items={stuckItems} empty="No stuck tasks." />
    <AlertSection title="Overdue tasks" items={overdueItems} empty="No overdue tasks." />
    <AlertSection title="Urgent priority" items={urgentItems} empty="No urgent tasks." />
    <h3>Recent activity</h3>
    <div className="update-list">{activities.slice(0,20).map(a=><div className={`update-card ${a.urgent?'urgent-card':''}`} key={a.id}>
      <strong>{a.actor}</strong><p>{a.message}</p><span>{new Date(a.createdAt).toLocaleString()}</span>
    </div>)}</div>
  </aside></div>;
}

function AlertSection({title,items,empty}) {
  return <section className="alert-section"><h3>{title} <span>{items.length}</span></h3>
    {items.length ? items.map(i=><div className="alert-task" key={i.id}><strong>{i.task}</strong><small>{i.owner || 'Unassigned'}{i.dueDate?` · Due ${i.dueDate}`:''}</small></div>) : <p className="muted">{empty}</p>}
  </section>;
}

function slug(v=''){ return String(v).toLowerCase().replaceAll(' ','-'); }
