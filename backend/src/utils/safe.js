/**
 * Small input-safety helpers shared by controllers.
 */

/** Escape a user-supplied string before it reaches a RegExp. */
export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * True only for a non-empty string. Use before any lookup that takes a value
 * from the request body — an object such as `{ $ne: null }` must never reach
 * a Mongoose filter.
 */
export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Copy only the named fields from a request body. Replaces spreading `req.body`
 * straight into a model, which otherwise lets a caller set fields such as
 * `status`, `quotedAmount` or `user`.
 */
export const pick = (source, keys) => {
  const picked = {};
  if (!source || typeof source !== "object") return picked;

  for (const key of keys) {
    if (
      Object.prototype.hasOwnProperty.call(source, key) &&
      source[key] !== undefined
    ) {
      picked[key] = source[key];
    }
  }
  return picked;
};

/** Normalise a free-text folder into a safe ImageKit path. */
export const safeFolder = (value, fallback) => {
  if (typeof value !== "string") return fallback;

  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");

  if (!cleaned || cleaned.includes("..")) return fallback;
  return cleaned.slice(0, 120);
};

/** Normalise a filename so it cannot traverse or carry control characters. */
export const safeFileName = (value, fallback = "upload") => {
  const base = typeof value === "string" ? value.split(/[\\/]/).pop() : "";
  const cleaned = (base || fallback)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(-120);
  return cleaned || fallback;
};
