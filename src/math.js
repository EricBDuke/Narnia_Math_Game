// Math gate: problem generation and checking.
// Difficulty ranges (easier since the last pass: each level moved down one step; Ultimate tops out at 4-digit by 2-digit):
export const DIFFICULTIES = {
  easy:     { label: 'Easy',     mul: [[1, 1], [1, 1], [2, 1]], div: [[2, 1], [2, 1]], blurb: '1-2 digit numbers times 1 digit' },
  medium:   { label: 'Medium',   mul: [[2, 1], [2, 1], [3, 1]], div: [[2, 1], [3, 1]], blurb: '2-3 digit numbers times 1 digit' },
  hard:     { label: 'Hard',     mul: [[3, 1], [2, 2], [4, 1]], div: [[3, 1], [4, 1]], blurb: 'Up to 4 digits, 2-digit by 2-digit' },
  ultimate: { label: 'Ultimate', mul: [[3, 2], [4, 2]],         div: [[3, 2], [4, 2]], blurb: '3-4 digits by 2 digits' },
};
export const GATE = { total: 5, pass: 4 }; // need 4 of 5 to fight
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const nDigit = (n) => rnd(n === 1 ? 2 : 10 ** (n - 1), 10 ** n - 1); // 1-digit: 2..9 (no x1/x0)
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function makeProblem(diff, kind) {
  const D = DIFFICULTIES[diff];
  if (kind === 'mul') {
    const [a, b] = pick(D.mul);
    let x = nDigit(a), y = nDigit(b);
    if (b === 2 && y % 10 === 0) y += 1;
    return { kind: 'mul', a: x, b: y, answer: x * y, text: `${x.toLocaleString()} × ${y}` };
  }
  const [a, b] = pick(D.div);
  let divisor = nDigit(b);
  if (divisor % 10 === 0) divisor += 1;
  let dividend = nDigit(a);
  if (dividend < divisor * 2) dividend = divisor * 2 + rnd(1, divisor - 1);
  if (dividend > 10 ** a - 1) dividend = 10 ** a - 1;
  return { kind: 'div', a: dividend, b: divisor, q: Math.floor(dividend / divisor), r: dividend % divisor,
    text: `${dividend.toLocaleString()} ÷ ${divisor}` };
}
export function makeSet(diff, mode = 'mixed') {
  const out = [];
  for (let i = 0; i < GATE.total; i++) {
    const kind = mode === 'mul' ? 'mul' : mode === 'div' ? 'div' : (i % 2 ? 'div' : 'mul');
    out.push(makeProblem(diff, kind));
  }
  // shuffle so they alternate unpredictably
  for (let i = out.length - 1; i > 0; i--) { const j = rnd(0, i); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
export function check(p, ans, rem) {
  if (p.kind === 'mul') return Number(ans) === p.answer;
  return Number(ans) === p.q && Number(rem || 0) === p.r;
}
// Aslan-style hint: first step of long division / partial products for multiplication
export function hint(p) {
  if (p.kind === 'div') {
    const s = String(p.a); let i = 0, part = 0;
    while (i < s.length && part < p.b) { part = part * 10 + Number(s[i]); i++; }
    const t = Math.floor(part / p.b);
    return `Slowly now. How many times does ${p.b} go into ${part}? Try ${t}, then check it: ${t} × ${p.b} = ${t * p.b}. Bring down the next digit and keep going. The remainder is what is left at the end.`;
  }
  if (p.b >= 10) {
    const ones = p.b % 10, tens = p.b - ones;
    return `Break it apart: ${p.a.toLocaleString()} × ${tens} = ${(p.a * tens).toLocaleString()}, and ${p.a.toLocaleString()} × ${ones} = ${(p.a * ones).toLocaleString()}. Now add them together.`;
  }
  return `Multiply one place at a time, starting with the ones, and carry when you need to.`;
}
export function explain(p) {
  return p.kind === 'mul' ? `${p.text} = ${p.answer.toLocaleString()}` : `${p.text} = ${p.q.toLocaleString()} remainder ${p.r}`;
}
