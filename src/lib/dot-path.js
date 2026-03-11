export function getByPath(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

export function setByPath(obj, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  let i = 0;
  const target = keys.reduce((o, k) => {
    const nextKey = keys[i + 1] ?? last;
    if (o[k] === undefined) o[k] = /^\d+$/.test(nextKey) ? [] : {};
    i++;
    return o[k];
  }, obj);
  target[last] = value;
}
