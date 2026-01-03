import React, { useEffect, useState } from 'react'
import { db } from '../firebaseClient.js'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

export default function AdminDashboard(){
  const [audit,setAudit]=useState([]); const [comm,setComm]=useState([]);
  useEffect(()=>{
    const run = async ()=>{
      const a = await getDocs(query(collection(db,'auditLogs'), orderBy('createdAt'), limit(200)));
      const c = await getDocs(query(collection(db,'commissions'), orderBy('createdAt'), limit(200)));
      setAudit(a.docs.map(d=>({ id:d.id, ...d.data() })));
      setComm(c.docs.map(d=>({ id:d.id, ...d.data() })));
    }
    run()
  },[])
  return <div style={{padding:16}}><h2>Admin</h2><h3>Audit</h3><ul>{audit.map(a=> <li key={a.id}>{a.action}</li>)}</ul><h3>Commissions</h3><ul>{comm.map(c=> <li key={c.id}>{c.source} - {c.commissionAmount}</li>)}</ul></div>
}
