import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, hashPassword, comparePassword } from '../src/models/user.model.js';
const sign = (user)=> jwt.sign({id:user.id,role:user.role}, process.env.JWT_SECRET, {expiresIn:'7d'});
export const register = async (req,res)=>{ const {name,email,password,role,phone}=req.body; const exists=await getUserByEmail(email); if(exists) return res.status(409).json({message:'Email taken'}); const passwordHash=await hashPassword(password); const user=await createUser({name,email,passwordHash,phone,role}); res.json({token:sign(user),user}); };
export const login = async (req,res)=>{ const {email,password}=req.body; const user=await getUserByEmail(email); if(!user) return res.status(401).json({message:'Invalid credentials'}); const ok=await comparePassword(password,user.passwordHash); if(!ok) return res.status(401).json({message:'Invalid credentials'}); res.json({token:sign(user),user:{id:user.id,name:user.name,email:user.email,role:user.role}}); };
export const me = async (req,res)=>{ const u=req.user; res.json({id:u.id,name:u.name,email:u.email,role:u.role}); };
