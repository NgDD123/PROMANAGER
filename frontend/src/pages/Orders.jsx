import React, { useState } from 'react'
import { db } from '../firebaseClient.js'
import { collection, addDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext.jsx'

export default function Orders(){ 
  const { user } = useAuth()
  const [pharmacyId,setPharmacyId]=useState(''); const [items,setItems]=useState('[{"sku":"<skuId>","qty":1}]'); const [addr,setAddr]=useState('{"line1":"Kigali"}'); const [res,setRes]=useState(null);
  const submit=async()=>{ if(!user) return alert('Please login first'); const order = { patient: user.uid, pharmacy: pharmacyId, items: JSON.parse(items), address: JSON.parse(addr), subtotal:0, deliveryFee:0, total:0, paymentStatus:'PENDING', orderStatus:'PLACED', createdAt: new Date() }; const ref = await addDoc(collection(db,'orders'), order); setRes({ id: ref.id, ...order }); }
  return <div style={{padding:16}}><h2>Create Order</h2><input placeholder='Pharmacy ID' value={pharmacyId} onChange={e=>setPharmacyId(e.target.value)} /><textarea rows={4} value={items} onChange={e=>setItems(e.target.value)} /><textarea rows={3} value={addr} onChange={e=>setAddr(e.target.value)} /><button onClick={submit}>Create</button>{res && <pre>{JSON.stringify(res,null,2)}</pre>}</div>
}
