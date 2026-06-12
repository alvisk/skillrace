const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

const hits = new Map();

const rateLimit = (req) => {
  const key = req.socket.remoteAddress ?? "unknown";
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);
  recent.push(now);
  hits.set(key, recent);
  return recent.length <= MAX_REQUESTS;
};

module.exports = { rateLimit };
