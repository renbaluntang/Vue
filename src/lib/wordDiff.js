/**
 * Word-level comparison of a student's passage with the assessor's corrected
 * version, so the Writing page can show the correction as markup on the
 * student's own words instead of as a second block to compare by eye.
 *
 * Returns a list of { type: 'eq' | 'del' | 'ins', text, gap } segments in
 * reading order. `gap` is the whitespace that follows the word, taken from the
 * corrected text, so its paragraph breaks survive.
 */

// Quotes and brackets around a word don't count as a change: the assessor
// often drops the quotes a student put around the passage they pasted in.
const EDGES = /^["“”'‘’(]+|["“”'‘’)]+$/g;
const norm = (word) => word.replace(EDGES, '');

const tokenize = (text) => {
  const out = [];
  const re = /(\S+)(\s*)/g;
  let m;
  while ((m = re.exec(String(text ?? '')))) out.push({ word: m[1], gap: m[2] });
  return out;
};

/**
 * @param {string} original  the passage as the student sent it
 * @param {string} corrected the assessor's corrected version
 * @param {object} [opts]
 * @param {number} [opts.context] a run of removed words longer than this at the
 *   very start or end is treated as the student's covering note ("Please check
 *   my grammar"), not as part of the passage, and is left out.
 */
export function diffWords(original, corrected, { context = 6 } = {}) {
  const a = tokenize(original);
  const b = tokenize(corrected);
  const n = a.length;
  const m = b.length;
  const W = m + 1;

  // Longest common subsequence, filled from the end so the walk below can
  // go forwards. Passages are capped at a few hundred words, so a full table
  // is small.
  const dp = new Uint16Array((n + 1) * W);
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i * W + j] = norm(a[i].word) === norm(b[j].word)
        ? dp[(i + 1) * W + j + 1] + 1
        : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
    }
  }

  // On a tie the removed word comes first, so a replacement reads as
  // "~~work~~ working" rather than the other way round.
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (norm(a[i].word) === norm(b[j].word)) {
      ops.push({ type: 'eq', text: b[j].word, gap: b[j].gap });
      i += 1; j += 1;
    } else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) {
      ops.push({ type: 'del', text: a[i].word, gap: ' ' });
      i += 1;
    } else {
      ops.push({ type: 'ins', text: b[j].word, gap: b[j].gap });
      j += 1;
    }
  }
  for (; i < n; i += 1) ops.push({ type: 'del', text: a[i].word, gap: ' ' });
  for (; j < m; j += 1) ops.push({ type: 'ins', text: b[j].word, gap: b[j].gap });

  const dropLeadingNote = (list) => {
    let k = 0;
    while (k < list.length && list[k].type === 'del') k += 1;
    return k > context ? list.slice(k) : list;
  };
  return dropLeadingNote(dropLeadingNote(ops).reverse()).reverse();
}

/** How many separate places changed: each unbroken run of edits counts once. */
export function changeCount(segments) {
  let count = 0;
  let inRun = false;
  for (const s of segments) {
    if (s.type === 'eq') inRun = false;
    else if (!inRun) { count += 1; inRun = true; }
  }
  return count;
}
