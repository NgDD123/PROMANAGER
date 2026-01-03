import React, { useEffect, useState } from 'react'
import { db } from '../firebaseClient.js'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

export default function Clinics(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ const run = async ()=>{ const snap = await getDocs(query(collection(db,'clinics'), orderBy('createdAt'), limit(50))); setRows(snap.docs.map(d=>({ id:d.id, ...d.data() }))) }; run() },[])
  return <div style={{padding:16}}><h2>Clinics</h2><ul>{rows.map(r=> <li key={r.id}>{r.name}</li>)}</ul></div>
}
