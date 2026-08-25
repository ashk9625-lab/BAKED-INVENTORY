'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'baked-work-management-v1';

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

export default function WorkManagementClient() {
  const [data, setData] = useState(initialData);
  const [view, setView] = useState('table');
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  function updateBoardName(value) {
    setData(d => ({...d, boardName:value}));
  }

  function addGroup() {
    setData(d => ({
      ...d,
      groups:[...d.groups,{id:uid('g'),name:'New Group',items:[]}]
    }));
  }

  function renameGroup(groupId, name) {
    setData(d => ({
      ...d,
      groups:d.groups.map(g => g.id===groupId ? {...g,name} : g)
    }));
  }

  function deleteGroup(groupId) {
    if (!confirm('Delete this group and all items inside it?')) return;
    setData(d => ({...d,groups:d.groups.filter(g=>g.id!==groupId)}));
  }

  function addItem(groupId) {
    const item = {
      id:uid('i'),
      task:'New item',
      owner:'Unassigned',
      status:'Not Started',
      priority:'Medium',
      dueDate:'',
      note:'',
      done:false,
      updates:[]
    };
    setData(d => ({
      ...d,
      groups:d.groups.map(g => g.id===groupId ? {...g,items:[...g.items,item]} : g)
    }));
  }

  function updateItem(groupId, itemId, changes) {
    setData(d => ({
      ...d,
      groups:d.groups.map(g => g.id===groupId
        ? {...g,items:g.items.map(i=>i.id===itemId?{...i,...changes}:i)}
        : g)
    }));
  }

  function deleteItem(groupId,itemId) {
    setData(d=>({
      ...d,
      groups:d.groups.map(g=>g.id===groupId
        ? {...g,items:g.items.filter(i=>i.id!==itemId)}
        : g)
    }));
    if(selectedItem?.id===itemId) setSelectedItem(null);
  }

  function addUpdate(groupId,itemId,text) {
    const body = String(text||'').trim();
    if(!body) return;
    const update = {id:uid('u'),body,createdAt:new Date().toISOString()};
    setData(d=>({
      ...d,
      groups:d.groups.map(g=>g.id===groupId
        ? {...g,items:g.items.map(i=>i.id===itemId?{...i,updates:[...(i.updates||[]),update]}:i)}
        : g)
    }));
  }

  const visibleGroups = useMemo(() => {
    const q=query.trim().toLowerCase();
    if(!q) return data.groups;
    return data.groups.map(g=>({
      ...g,
      items:g.items.filter(i =>
        [i.task,i.owner,i.status,i.priority,i.note]
          .some(v=>String(v||'').toLowerCase().includes(q))
      )
    })).filter(g=>g.items.length);
  },[data.groups,query]);

  const allItems = useMemo(
    ()=>data.groups.flatMap(g=>g.items.map(i=>({...i,groupId:g.id,groupName:g.name}))),
    [data.groups]
  );

  const counts = useMemo(()=>({
    total:allItems.length,
    done:allItems.filter(i=>i.status==='Done').length,
    working:allItems.filter(i=>i.status==='Working on it').length,
    stuck:allItems.filter(i=>i.status==='Stuck').length
  }),[allItems]);

  return <div className="monday-shell">
    <header className="monday-top">
      <div>
        <div className="eyebrow">BAKED INVENTORY</div>
        <input
          className="board-title-input"
          value={data.boardName}
          onChange={e=>updateBoardName(e.target.value)}
        />
        <div className="board-subtitle">Work Management</div>
      </div>
      <div className="top-actions">
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

    <div className="toolbar">
      <button className="primary" onClick={addGroup}>+ New Group</button>
      <input placeholder="Search board..." value={query} onChange={e=>setQuery(e.target.value)} />
    </div>

    {view==='table'
      ? <TableBoard
          groups={visibleGroups}
          renameGroup={renameGroup}
          deleteGroup={deleteGroup}
          addItem={addItem}
          updateItem={updateItem}
          deleteItem={deleteItem}
          setSelectedItem={setSelectedItem}
        />
      : <KanbanBoard
          items={allItems}
          updateItem={updateItem}
          setSelectedItem={setSelectedItem}
        />
    }

    {selectedItem && (
      <UpdatesPanel
        item={allItems.find(i=>i.id===selectedItem.id) || selectedItem}
        onClose={()=>setSelectedItem(null)}
        addUpdate={addUpdate}
      />
    )}
  </div>;
}

function TableBoard({groups,renameGroup,deleteGroup,addItem,updateItem,deleteItem,setSelectedItem}) {
  return <div className="board-wrap">
    {groups.map((g,gi)=><section className="group-block" key={g.id}>
      <div className="group-head">
        <input value={g.name} onChange={e=>renameGroup(g.id,e.target.value)} />
        <div className="group-head-actions">
          <span>{g.items.length} items</span>
          <button onClick={()=>deleteGroup(g.id)}>Delete Group</button>
        </div>
      </div>

      <div className="board-table-wrap">
        <table className="board-table">
          <thead><tr>
            <th className="check-col"></th>
            <th>Item</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Notes</th>
            <th>Updates</th>
            <th></th>
          </tr></thead>
          <tbody>
            {g.items.map(i=><tr key={i.id}>
              <td><input type="checkbox" checked={!!i.done} onChange={e=>updateItem(g.id,i.id,{done:e.target.checked,status:e.target.checked?'Done':i.status})}/></td>
              <td><input className="item-name" value={i.task} onChange={e=>updateItem(g.id,i.id,{task:e.target.value})}/></td>
              <td><input value={i.owner} onChange={e=>updateItem(g.id,i.id,{owner:e.target.value})}/></td>
              <td>
                <select className={`status-pill status-${slug(i.status)}`} value={i.status} onChange={e=>updateItem(g.id,i.id,{status:e.target.value})}>
                  {statuses.map(s=><option key={s}>{s}</option>)}
                </select>
              </td>
              <td>
                <select className={`priority-pill priority-${slug(i.priority)}`} value={i.priority} onChange={e=>updateItem(g.id,i.id,{priority:e.target.value})}>
                  {priorities.map(p=><option key={p}>{p}</option>)}
                </select>
              </td>
              <td><input type="date" value={i.dueDate} onChange={e=>updateItem(g.id,i.id,{dueDate:e.target.value})}/></td>
              <td><input value={i.note} onChange={e=>updateItem(g.id,i.id,{note:e.target.value})}/></td>
              <td><button className="updates-btn" onClick={()=>setSelectedItem({...i,groupId:g.id})}>{i.updates?.length||0} updates</button></td>
              <td><button className="icon-btn" onClick={()=>deleteItem(g.id,i.id)}>×</button></td>
            </tr>)}
            <tr className="add-row">
              <td></td><td colSpan="8"><button onClick={()=>addItem(g.id)}>+ Add Item</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>)}
  </div>
}

function KanbanBoard({items,updateItem,setSelectedItem}) {
  return <div className="kanban-grid">
    {statuses.map(status=><div className="kanban-col" key={status}>
      <div className={`kanban-title status-${slug(status)}`}>
        <span>{status}</span><strong>{items.filter(i=>i.status===status).length}</strong>
      </div>
      {items.filter(i=>i.status===status).map(i=><div className="kanban-card" key={i.id}>
        <strong onClick={()=>setSelectedItem(i)}>{i.task}</strong>
        <span>{i.groupName}</span>
        <span>{i.owner}</span>
        <span>{i.priority}</span>
        {i.dueDate && <span>Due: {i.dueDate}</span>}
        <select value={i.status} onChange={e=>updateItem(i.groupId,i.id,{status:e.target.value})}>
          {statuses.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>)}
    </div>)}
  </div>
}

function UpdatesPanel({item,onClose,addUpdate}) {
  const [text,setText]=useState('');
  function submit(e){
    e.preventDefault();
    addUpdate(item.groupId,item.id,text);
    setText('');
  }
  return <div className="updates-overlay" onClick={onClose}>
    <aside className="updates-panel" onClick={e=>e.stopPropagation()}>
      <button className="panel-close" onClick={onClose}>×</button>
      <div className="eyebrow">ITEM UPDATES</div>
      <h2>{item.task}</h2>
      <p className="muted">{item.note || 'No notes yet.'}</p>
      <form onSubmit={submit} className="update-form">
        <textarea rows="4" placeholder="Write an update..." value={text} onChange={e=>setText(e.target.value)} />
        <button className="primary">Post Update</button>
      </form>
      <div className="update-list">
        {(item.updates||[]).slice().reverse().map(u=><div className="update-card" key={u.id}>
          <strong>BAKED Staff</strong>
          <p>{u.body}</p>
          <span>{new Date(u.createdAt).toLocaleString()}</span>
        </div>)}
      </div>
    </aside>
  </div>
}

function slug(v=''){ return String(v).toLowerCase().replaceAll(' ','-'); }
