import React, { useEffect, useState } from 'react'
import { db } from '../firebaseClient.js'
import { collection, getDocs } from 'firebase/firestore'

export default function Branding(){
  const [rows,setRows]=useState([])
  useEffect(()=>{ const run=async()=>{ const snap = await getDocs(collection(db,'branding')); setRows(snap.docs.map(d=>({ id:d.id, ...d.data() }))) }; run() },[])
  return <div style={{padding:16}}><h2>Branding Partners</h2><ul>{rows.map(r=> <li key={r.id}>{r.name} – Fee: {r.serviceFeePerOrder}</li>)}</ul></div>
}
