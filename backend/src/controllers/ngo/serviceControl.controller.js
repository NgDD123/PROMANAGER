import { ServiceControl } from '../../models/ngo/serviceControl.model.js';
import { buildOwnedResourceHandlers } from './ngoOwnedResource.controller.js';

const handlers = buildOwnedResourceHandlers(ServiceControl, 'Service control');

export const createServiceControl = handlers.create;
export const getAllServiceControls = handlers.getAll;
export const getServiceControl = handlers.getById;
export const updateServiceControl = handlers.update;
export const deleteServiceControl = handlers.remove;
