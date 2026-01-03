import React, { useState } from 'react'
import api from '../services/api.js'
import { db } from '../firebaseClient.js'
import { collection, addDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext.jsx'

export default function Payments(){ 
  const { user } = useAuth()
  const [amount,setAmount]=useState(10); const [resp,setResp]=useState(null);
  const create=async()=>{ 
    try{
      const { data } = await api.post('/payments/intent', { amount, currency: 'USD', provider: 'mock' });
      setResp(data)
    }catch(e){
      if(!user) return alert('login first');
      const p = { provider:'mock', amount, currency:'USD', status:'PENDING', user: user.uid, createdAt: new Date() };
      const ref = await addDoc(collection(db,'payments'), p);
      setResp({ paymentId: ref.id, provider:'mock' })
    }
  }
  return <div style={{padding:16}}><h2>Payments</h2><input type='number' value={amount} onChange={e=>setAmount(Number(e.target.value))} /><button onClick={create}>Create</button>{resp && <pre>{JSON.stringify(resp,null,2)}</pre>}</div>
}
