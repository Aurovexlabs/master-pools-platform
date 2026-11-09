/**
 * Simple in-memory rate limiter.
 *
 * Each limiter keeps its own bucket — previously all three shared one module
 * level map, so an auth attempt counted against the upload budget. Idle keys
 * are evicted so the map cannot grow without bound.
 *
 * For multi-instance deployments replace with a shared store (Redis).
 */
export const rateLimit = ({
  windowMs = 60_000,
  max = 100,
  message = "Too many requests",
} = {}) => {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = (hits.get(key) || []).filter((t) => t > windowStart);
    timestamps.push(now);
    hits.set(key, timestamps);

    if (hits.size > 5000) {
      for (const [entryKey, entry] of hits) {
        if (!entry.length || entry[entry.length - 1] < windowStart) {
          hits.delete(entryKey);
        }
      }
    }

    if (timestamps.length > max) {
      return res.status(429).json({ message });
    }
    return next();
  };
};

export const authRateLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  message: "Too many auth attempts. Wait 15 minutes.",
});
export const apiRateLimit = rateLimit({ windowMs: 60_000, max: 200 });
export const uploadRateLimit = rateLimit({
  windowMs: 60_000,
  max: 20,
  message: "Upload limit reached. Try again in a minute.",
});
