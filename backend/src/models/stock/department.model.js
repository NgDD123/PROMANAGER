// models/department.model.js
import { db } from "../../../utils/firebase";

const DEPARTMENTS = "departments";

export const coll = () => db().collection(DEPARTMENTS);

export const createDepartment = async ({ name, code = null, meta = {} }) => {
  const doc = await coll().add({
    name,
    code,
    meta,
    createdAt: new Date(),
  });
  return { id: doc.id, name, code, meta };
};

export const getDepartmentById = async (id) => {
  const d = await coll().doc(id).get();
  if (!d.exists) return null;
  return { id: d.id, ...d.data() };
};
