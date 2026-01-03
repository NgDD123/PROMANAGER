import { db } from '../utils/firebase.js';
import bcrypt from 'bcryptjs';
const coll = ()=> db().collection('users');
export const createUser = async ({name,email,passwordHash,phone,role='PATIENT'})=>{ const doc=await coll().add({name,email,passwordHash,phone,role,createdAt:new Date()}); return {id:doc.id,name,email,phone,role}; };
export const getUserByEmail = async (email)=>{ const snap=await coll().where('email','==',email).limit(1).get(); if(snap.empty) return null; const d=snap.docs[0].data(); d.id=snap.docs[0].id; return d; };
export const getUserById = async (id)=>{ const doc=await coll().doc(id).get(); if(!doc.exists) return null; return {id:doc.id,...doc.data()}; };
export const hashPassword = async (pwd)=>{ const s=await bcrypt.genSalt(10); return bcrypt.hash(pwd,s); };
export const comparePassword = async (pwd,hash)=> bcrypt.compare(pwd,hash);
