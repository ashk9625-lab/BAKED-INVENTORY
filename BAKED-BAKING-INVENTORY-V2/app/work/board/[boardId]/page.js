import {Shell} from '../../../components';
import {prisma} from '../../../../lib/prisma';
import BoardClient from './board-client';

export const dynamic='force-dynamic';

export default async function BoardPage({params}){
  const p=await params; const id=Number(p.boardId);
  const [board,people]=await Promise.all([
    prisma.workBoard.findUnique({
      where:{id},
      include:{
        workspace:true,
        items:{
          include:{assignee:true,createdBy:true,comments:{include:{author:true},orderBy:{createdAt:'asc'}}},
          orderBy:[{status:'asc'},{createdAt:'asc'}]
        }
      }
    }),
    prisma.teamMember.findMany({where:{active:true},select:{id:true,name:true,email:true,role:true},orderBy:{name:'asc'}})
  ]);
  if(!board) return <Shell><div className="notice">Board not found.</div></Shell>;

  const data={
    id:board.id,name:board.name,description:board.description||'',workspace:board.workspace.name,
    items:board.items.map(i=>({
      id:i.id,title:i.title,description:i.description||'',status:i.status,priority:i.priority,
      dueDate:i.dueDate?i.dueDate.toISOString().slice(0,10):'',
      assignee:i.assignee?{id:i.assignee.id,name:i.assignee.name}:null,
      createdBy:i.createdBy?.name||'Unknown',
      comments:i.comments.map(c=>({id:c.id,body:c.body,author:c.author?.name||'Unknown',createdAt:c.createdAt.toISOString()}))
    }))
  };

  return <Shell><BoardClient initialBoard={data} people={people}/></Shell>;
}
