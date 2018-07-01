export const nil = "";

const escape = (segment) => segment.toString().replace("~", "~0").replace("/", "~1");
const unescape = (segment) => segment.toString().replace("~0", "~").replace("~1", "/");

export const decons = (pointer) => {
  const ndx = pointer.indexOf("/", 1);
  const [segment, remainingPointer] = (ndx === -1) ?
    [pointer.slice(1), nil] : [pointer.slice(1, ndx), pointer.slice(ndx)];

  return [unescape(segment), remainingPointer];
};

export const cons = (head, tail) => {
  return "/" + escape(head) + tail;
};

export const append = (pointer, segment) => {
  return pointer + "/" + escape(segment);
};

export const get = (value, pointer = nil) => {
  if (pointer === nil) {
    return value;
  } else {
    const [segment, remainingPointer] = decons(pointer);
    return get(value[segment], remainingPointer);
  }
};
