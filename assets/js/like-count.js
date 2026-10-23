(function (root) {
  "use strict";

  function parseCount(value) {
    if (typeof value !== "number" && typeof value !== "string") return null;
    if (!/^\d+$/.test(String(value))) return null;
    const count = Number(value);
    return Number.isSafeInteger(count) && count >= 0 ? count : null;
  }

  function selectCount(items, count) {
    return count === null ? items.slice() : items.filter(item => parseCount(item.count) === count);
  }

  function analyze(items) {
    const valid = items.filter(item => parseCount(item.count) !== null);
    const repeated = valid.filter(item => parseCount(item.count) >= 2);
    const total = valid.reduce((sum, item) => sum + parseCount(item.count), 0);
    const repeatedTotal = repeated.reduce((sum, item) => sum + parseCount(item.count), 0);
    const buckets = new Map();
    valid.forEach(item => {
      const count = parseCount(item.count);
      buckets.set(count, (buckets.get(count) || 0) + 1);
    });
    const ranked = repeated.slice().sort((a, b) => parseCount(b.count) - parseCount(a.count));
    const cutoff = ranked.length > 10 ? parseCount(ranked[9].count) : 2;
    return {
      valid: valid.length,
      invalid: items.length - valid.length,
      total: total,
      repeated: repeated.length,
      repeatedShare: valid.length ? repeated.length / valid.length : null,
      contribution: total ? repeatedTotal / total : null,
      uniform: valid.length > 0 && buckets.size === 1,
      distribution: Array.from(buckets, ([count, size]) => ({count, size, share: size / valid.length})).sort((a, b) => a.count - b.count),
      top: ranked.filter(item => parseCount(item.count) >= cutoff)
    };
  }

  const api = {parseCount, selectCount, analyze};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LikeCount = api;
}(typeof window !== "undefined" ? window : globalThis));
