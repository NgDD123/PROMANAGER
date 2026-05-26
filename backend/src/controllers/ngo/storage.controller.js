import { Storage } from '../../models/ngo/storage.model.js';
import { buildOwnedResourceHandlers } from './ngoOwnedResource.controller.js';

const handlers = buildOwnedResourceHandlers(Storage, 'Storage');

export const createStorage = handlers.create;
export const getAllStorages = handlers.getAll;
export const getStorage = handlers.getById;
export const updateStorage = handlers.update;
export const deleteStorage = handlers.remove;
