// The moss ball: a stippled fibonacci sphere with a sprout at the north pole.
// markSvg() is the logo mark (Mark.astro, /favicon.svg); plateSvg() is the
// hero specimen plate, which orb.ts animates with the same geometry.

const MOSS = '#3D6B45';
const LEAF = '#8DBF7A';
const TILT = 0.32;
const [CT, ST] = [Math.cos(TILT), Math.sin(TILT)];

export interface Ball {
  n: number;
  r: number;
  cx: number;
  cy: number;
  dot: [number, number]; // radius at back, added radius at front
  fuzz: number; // radial jitter: the mossy edge
  stray?: number; // occasional longer strands
  sprout: number; // sprout scale
  colors: [string, string]; // dark, light
}

export const PLATE: Ball = {
  n: 2200,
  r: 118,
  cx: 200,
  cy: 236,
  dot: [0.8, 1.9],
  fuzz: 0.12,
  stray: 0.14,
  sprout: 1.1,
  colors: ['#35452F', '#8A9C72'],
};
export const PLATE_SIZE = [400, 420] as const;

export function spherePoints({ n, fuzz, stray = 0 }: Ball) {
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const t = i * Math.PI * (3 - Math.sqrt(5));
    const k = 1 + (rand() - 0.5) * fuzz + (stray && rand() < 0.06 ? rand() * stray : 0);
    const light = rand() < 0.3;
    return { x: Math.cos(t) * rr * k, y: y * k, z: Math.sin(t) * rr * k, light };
  });
}

// Spin by `a` around the vertical axis, then tilt toward the viewer.
// Returns unit-sphere screen coords and depth d (0 = back, 1 = front).
export function project(p: { x: number; y: number; z: number }, a: number) {
  const [ca, sa] = [Math.cos(a), Math.sin(a)];
  const x1 = p.x * ca + p.z * sa;
  const z1 = -p.x * sa + p.z * ca;
  return { x: x1, y: p.y * CT - z1 * ST, d: (p.y * ST + z1 * CT + 1.2) / 2.4 };
}

// Stem and two leaves as SVG path data; `sway` bends the tip sideways.
export function sproutPaths({ r, cx, cy, sprout: s, colors }: Ball, sway = 0) {
  const px = cx;
  const py = cy - CT * r * 1.02;
  const tx = px + sway * 30 * s;
  const ty = py - 24 * s;
  const leaf = (len: number, ang: number) => {
    const [c, n] = [Math.cos(ang + sway), Math.sin(ang + sway)];
    const pt = (x: number, y: number) => `${(tx + x * c - y * n).toFixed(2)} ${(ty + x * n + y * c).toFixed(2)}`;
    return `M${pt(0, 0)}Q${pt(len * 0.5, -len * 0.45)} ${pt(len, 0)}Q${pt(len * 0.5, len * 0.3)} ${pt(0, 0)}Z`;
  };
  return {
    stem: `M${px} ${py.toFixed(2)}Q${(px + 2 * s).toFixed(2)} ${(py - 12 * s).toFixed(2)} ${tx.toFixed(2)} ${ty.toFixed(2)}`,
    width: 3 * s,
    leaves: [
      { d: leaf(26 * s, Math.PI + 0.5), fill: colors[1] },
      { d: leaf(30 * s, -0.55), fill: colors[0] },
    ],
  };
}

function ball(b: Ball): string {
  const dots = spherePoints(b)
    .map((p) => ({ ...project(p, 0.6), light: p.light }))
    .sort((p, q) => p.d - q.d) // back to front
    .map(
      (p) =>
        `<circle cx="${(b.cx + p.x * b.r).toFixed(2)}" cy="${(b.cy - p.y * b.r).toFixed(2)}" r="${(b.dot[0] + p.d * b.dot[1]).toFixed(2)}" fill="${p.light ? b.colors[1] : b.colors[0]}" fill-opacity="${(0.12 + p.d * 0.88).toFixed(2)}"/>`,
    )
    .join('');
  const sp = sproutPaths(b);
  return (
    dots +
    `<path d="${sp.stem}" stroke="${b.colors[0]}" stroke-width="${sp.width.toFixed(2)}" stroke-linecap="round" fill="none"/>` +
    sp.leaves.map((l) => `<path d="${l.d}" fill="${l.fill}"/>`).join('')
  );
}

export function markSvg(): string {
  const dots = ball({ n: 150, r: 10.5, cx: 16, cy: 19.6, dot: [0.35, 0.6], fuzz: 0.06, sprout: 10.5 / 60, colors: [MOSS, LEAF] });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${dots}</svg>`;
}

// Specimen plate: the ball (in .ball, which orb.ts swaps for a canvas) with a
// dashed growth ring and a leader to its note.
export function plateSvg(): string {
  const { cx, cy, r } = PLATE;
  const ring = r + 16;
  const lx = cx + ring * Math.cos(-0.5);
  const ly = cy + ring * Math.sin(-0.5);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PLATE_SIZE.join(' ')}">` +
    `<ellipse cx="${cx}" cy="${cy + r * 1.16}" rx="${r * 0.85}" ry="${r * 0.09}" fill="#35452F" fill-opacity=".08"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${ring}" fill="none" stroke="#586B46" stroke-opacity=".45" stroke-dasharray="2 5"/>` +
    `<g class="ball">${ball(PLATE)}</g>` +
    `<path d="M${lx.toFixed(1)} ${ly.toFixed(1)}L${lx + 28} ${ly - 46}H396" fill="none" stroke="#586B46" stroke-opacity=".7"/>` +
    `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.5" fill="#586B46"/>` +
    `</svg>`
  );
}
