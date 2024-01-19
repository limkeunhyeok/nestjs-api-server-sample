export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean';
};

export const isEmptyObject = (obj: any): boolean => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};
