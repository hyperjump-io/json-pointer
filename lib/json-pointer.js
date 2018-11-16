export const nil = "";

export const get = (pointer) => {
  if (pointer.length > 0 && pointer[0] !== "/") {
    throw Error("Invalid JSON Pointer");
  }

  const ptr = pointer.split("/").slice(1).map(unescape);

  return (value) => ptr.reduce(([value, pointer], segment) => {
    return [applySegment(value, segment, pointer), append(pointer, segment)];
  }, [value, ""])[0];
};

export const append = (pointer, segment) => pointer + "/" + escape(segment);

const escape = (segment) => segment.toString().replace("~", "~0").replace("/", "~1");
const unescape = (segment) => segment.toString().replace("~0", "~").replace("~1", "/");

const applySegment = (value, segment, pointer = "") => {
  if (value === null || typeof value !== "object") {
    throw Error(`Value at '${pointer}' is a scalar and can't be indexed`);
  } else if (!(segment in value)) {
    throw Error(`Value at '${pointer}' does not have index '${segment}'`);
  }

  return value[segment];
};
