export const toBool = (v: unknown) => {
  if (v === undefined) return undefined;
  if (v === true || v === false) return v;
  const s = String(v).toLowerCase().trim();
  if (s === 'true' || s === '1') return true;
  if (s === 'false' || s === '0') return false;
  return v;
};
