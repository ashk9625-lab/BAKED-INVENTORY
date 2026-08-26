import {Shell, EmptyRow} from '../components';
import {prisma} from '../../lib/prisma';
import Form from './form';

export const dynamic='force-dynamic';

export default async function Page(){
  const [recipes,batches]=await Promise.all([
    prisma.recipe.findMany({
      where:{active:true},
      include:{
        outputProduct:true,
        items:{include:{product:true}}
      },
      orderBy:{name:'asc'}
    }),
    prisma.productionBatch.findMany({
      orderBy:{createdAt:'desc'},
      take:50
    })
  ]);

  const recipeData=recipes.map(r=>({
    id:r.id,
    name:r.name,
    outputQuantity:Number(r.outputQuantity),
    outputUnit:r.outputProduct.unit,
    outputProduct:r.outputProduct.name,
    items:r.items.map(i=>({
      name:i.product.name,
      quantity:Number(i.quantity),
      unit:i.product.unit
    }))
  }));

  return <Shell>
    <div className="topbar">
      <div className="title">
        <h1>Production</h1>
        <p>Record completed production batches and automatically update stock movements.</p>
      </div>
    </div>

    <div className="card">
      <h2 style={{marginTop:0}}>Complete Production Batch</h2>
      {recipeData.length
        ? <Form recipes={recipeData}/>
        : <div className="notice">No active production setup is available yet.</div>}
    </div>

    <section className="section">
      <div className="section-head">
        <div>
          <h2>Recent Production Batches</h2>
          <p className="muted">Latest completed production activity.</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Batch</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {batches.length ? batches.map(b=><tr key={b.id}>
              <td>{new Date(b.createdAt).toLocaleString('en-ZA')}</td>
              <td><strong>{b.batchNumber}</strong></td>
              <td>{b.productName}</td>
              <td>{Number(b.quantityMade)} {b.unit}</td>
              <td>{b.status}</td>
              <td>{b.notes||'-'}</td>
            </tr>) : <EmptyRow colSpan={6}>No production batches yet.</EmptyRow>}
          </tbody>
        </table>
      </div>
    </section>
  </Shell>;
}
