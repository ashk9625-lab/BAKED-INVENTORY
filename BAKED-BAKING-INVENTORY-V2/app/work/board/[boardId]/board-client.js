'use client';
import {useMemo,useState} from 'react';

const statuses=[
  ['TO_DO','To Do'],['WORKING','Working on it'],['STUCK','Stuck'],['DONE','Done']
];
const priorities=['LOW','MEDIUM','HIGH','URGENT'];

export default function BoardClient({initialBoard,people}){
  const [board,setBoard]=useState(initialBoard);
  const [view,setView]=useState('table');
  const [selected,setSelected]=useState(null);
  const [busy,setBusy]=useState(false);

  async function refresh(){
    const r=await fetch(`/api/work/boards/${board.id}`);
    if(r.ok)setBoard(await r.json());
  }

  async function addItem(e){
    e.preventDefault();setBusy(true);
    const d=Object.fromEntries(new FormData(e.currentTarget));d.boardId=board.id;
    const r=await fetch('/api/work/items',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)});
    const j=await r.json().catch(()=>({}));setBusy(false);
    if(!r.ok)return alert(j.error||'Could not add item');
    e.currentTarget.reset();await refresh();
  }

  async function patch(id,changes){
    const r=await fetch(`/api/work/items/${id}`,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(changes)});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)return alert(j.error||'Could not update item');
    await refresh();
  }

  const grouped=useMemo(()=>Object.fromEntries(statuses.map(([s])=>[s,board.items.filter(i=>i.status===s)])),[board.items]);

  return <>
    <div className="topbar">
      <div className="title">
        <div className="label">{board.workspace}</div>
        <h1>{board.name}</h1><p>{board.description||'Operational work board'}</p>
      </div>
      <div className="actions">
        <button className={view==='table'?'':'secondary'} onClick={()=>setView('table')}>Table</button>
        <button className={view==='kanban'?'':'secondary'} onClick={()=>setView('kanban')}>Kanban</button>
      </div>
    </div>

    <div className="card">
      <div className="label">Add Item</div>
      <form onSubmit={addItem}>
        <div className="form-grid" style={{marginTop:12}}>
          <input name="title" placeholder="Task / item name" required/>
          <select name="assigneeId" defaultValue=""><option value="">Unassigned</option>{people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <select name="status" defaultValue="TO_DO">{statuses.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
          <select name="priority" defaultValue="MEDIUM">{priorities.map(p=><option key={p}>{p}</option>)}</select>
          <input name="dueDate" type="date"/>
          <input name="description" placeholder="Description"/>
        </div>
        <div className="actions" style={{marginTop:12}}><button disabled={busy}>{busy?'Adding…':'Add Item'}</button></div>
      </form>
    </div>

    {view==='table' ? <div className="table-wrap section">
      <table className="work-table">
        <thead><tr><th>Item</th><th>Owner</th><th>Status</th><th>Priority</th><th>Due</th><th>Updates</th></tr></thead>
        <tbody>{board.items.map(i=><tr key={i.id}>
          <td><button className="link-button" onClick={()=>setSelected(i)}>{i.title}</button><div className="muted">{i.description}</div></td>
          <td><select value={i.assignee?.id||''} onChange={e=>patch(i.id,{assigneeId:e.target.value||null})}><option value="">Unassigned</option>{people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
          <td><select value={i.status} onChange={e=>patch(i.id,{status:e.target.value})}>{statuses.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></td>
          <td><select value={i.priority} onChange={e=>patch(i.id,{priority:e.target.value})}>{priorities.map(p=><option key={p}>{p}</option>)}</select></td>
          <td><input type="date" value={i.dueDate||''} onChange={e=>patch(i.id,{dueDate:e.target.value||null})}/></td>
          <td><button className="secondary" onClick={()=>setSelected(i)}>{i.comments.length} comment{i.comments.length===1?'':'s'}</button></td>
        </tr>)}</tbody>
      </table>
    </div> : <div className="kanban section">
      {statuses.map(([s,label])=><div className="kanban-column" key={s}>
        <div className="kanban-head"><strong>{label}</strong><span>{grouped[s].length}</span></div>
        {grouped[s].map(i=><div className="kanban-card" key={i.id} onClick={()=>setSelected(i)}>
          <strong>{i.title}</strong>
          <span>{i.assignee?.name||'Unassigned'}</span>
          <span>{i.priority}</span>
          {i.dueDate&&<span>Due {i.dueDate}</span>}
        </div>)}
      </div>)}
    </div>}

    {selected&&<ItemPanel item={selected} close={()=>setSelected(null)} reload={async()=>{await refresh();setSelected(null)}}/>}
  </>;
}

function ItemPanel({item,close,reload}){
  const[busy,setBusy]=useState(false);
  async function comment(e){
    e.preventDefault();setBusy(true);
    const d=Object.fromEntries(new FormData(e.currentTarget));d.itemId=item.id;
    const r=await fetch('/api/work/comments',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)});
    const j=await r.json().catch(()=>({}));setBusy(false);
    if(!r.ok)return alert(j.error||'Could not add comment');
    await reload();
  }
  return <div className="work-modal" onClick={close}>
    <div className="work-panel" onClick={e=>e.stopPropagation()}>
      <button className="panel-close" onClick={close}>×</button>
      <h2>{item.title}</h2><p className="muted">{item.description||'No description'}</p>
      <div className="label">Updates & Comments</div>
      <div className="comment-list">{item.comments.length?item.comments.map(c=><div className="comment" key={c.id}><strong>{c.author}</strong><p>{c.body}</p></div>):<p className="muted">No comments yet.</p>}</div>
      <form onSubmit={comment}>
        <textarea name="body" placeholder="Write an update or comment…" required rows="4"/>
        <button disabled={busy} style={{marginTop:10}}>{busy?'Posting…':'Post Update'}</button>
      </form>
    </div>
  </div>
}
