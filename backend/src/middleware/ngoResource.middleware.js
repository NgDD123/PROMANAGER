import { ngoAuth, attachNgoUserContext, bindNgoTenant } from './ngoAuth.middleware.js';

export const ngoProtected = [ngoAuth, attachNgoUserContext, bindNgoTenant];
