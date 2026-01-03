import React, { useState } from 'react'
import { db } from '../firebaseClient.js'
import { collection, getDocs } from 'firebase/firestore'

export default function Quotes(){ 
  const [rxItems,setRxItems]=useState('[{"drugMaster":"dm_paracetamol_500"}]'); const [rows,setRows]=useState([]); 
  const getQuotes=async()=>{
    const rx = JSON.parse(rxItems);
    const phSnapshot = await getDocs(collection(db,'pharmacies'));
    const skusSnapshot = await getDocs(collection(db,'skus'));
    const skus = skusSnapshot.docs.map(d=>({ id:d.id, ...d.data() }));
    const candidates = [];
    for (const p of phSnapshot.docs){
      const ph = { id:p.id, ...p.data() };
      let total = 0; let covered = 0;
      for (const it of rx){
        const available = skus.filter(s => s.pharmacy === ph.id && s.drugMasterId === it.drugMaster);
        if (available.length){
          total += Math.min(...available.map(a=>a.price));
          covered++;
        }
      }
      candidates.push({ pharmacyId: ph.id, name: ph.name, total, coverage: rx.length ? covered / rx.length : 1 });
    }
    setRows(candidates.sort((a,b)=>a.total-b.total));
  }
  return <div style={{padding:16}}><h2>Quotes</h2><textarea rows={5} value={rxItems} onChange={e=>setRxItems(e.target.value)} /><button onClick={getQuotes}>Get Quotes</button><ul>{rows.map(r=> <li key={r.pharmacyId}>{r.name} - {r.total}</li>)}</ul></div>
}
