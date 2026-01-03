import jwt from 'jsonwebtoken';
import { getUserById } from '../models/user.model.js';
export const requireAuth = async (req,res,next)=>{ const auth=req.headers.authorization||''; const token=auth.startsWith('Bearer ')?auth.slice(7):null; if(!token) return res.status(401).json({message:'No token'}); try{ const payload=jwt.verify(token,process.env.JWT_SECRET); const user=await getUserById(payload.id); if(!user) throw new Error('User not found'); req.user=user; next(); }catch(e){ res.status(401).json({message:'Invalid token'}); } };
export const requireRole = (...roles)=> (req,res,next)=>{ if(!req.user||!roles.includes(req.user.role)) return res.status(403).json({message:'Forbidden'}); next(); };
