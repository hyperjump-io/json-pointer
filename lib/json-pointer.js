export const nil = "";

export const get = (pointer) => {
  const ptr = pointer.split("/").slice(1).map(unescape);
  return (value) => ptr.reduce((acc, segment) => acc[segment], value);
};

export const append = (pointer, segment) => pointer + "/" + escape(segment);

const escape = (segment) => segment.toString().replace("~", "~0").replace("/", "~1");
const unescape = (segment) => segment.toString().replace("~0", "~").replace("~1", "/");
