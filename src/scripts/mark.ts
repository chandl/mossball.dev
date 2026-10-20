// The moss ball, drawn as a stippled fibonacci sphere at build time.
// markSvg() is the logo mark (Mark.astro, /favicon.svg); plateSvg() is the
// larger specimen engraving in the hero.

const MOSS = '#3D6B45';
const LEAF = '#8DBF7A';

interface Ball {
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

function ball({ n, r, cx, cy, dot, fuzz, stray = 0, sprout: s, colors }: Ball): string {
  const [a, tilt] = [0.6, 0.32];
  const [ca, sa, ct, st] = [Math.cos(a), Math.sin(a), Math.cos(tilt), Math.sin(tilt)];

  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const dots = Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const t = i * Math.PI * (3 - Math.sqrt(5));
    const k = 1 + (rand() - 0.5) * fuzz + (stray && rand() < 0.06 ? rand() * stray : 0);
    const light = rand() < 0.3;
    const [x, z] = [Math.cos(t) * rr * k, Math.sin(t) * rr * k];
    const x1 = x * ca + z * sa;
    const z1 = -x * sa + z * ca;
    const d = (y * k * st + z1 * ct + 1.2) / 2.4; // 0 = back, 1 = front
    return { x: cx + x1 * r, y: cy - (y * k * ct - z1 * st) * r, d, light };
  })
    .sort((p, q) => p.d - q.d) // back to front
    .map(
      (p) =>
        `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${(dot[0] + p.d * dot[1]).toFixed(2)}" fill="${p.light ? colors[1] : colors[0]}" fill-opacity="${(0.12 + p.d * 0.88).toFixed(2)}"/>`,
    )
    .join('');

  // A sprout at the north pole.
  const px = cx;
  const py = cy - ct * r * 1.02;
  const [tx, ty] = [px, py - 24 * s];
  const leaf = (len: number, ang: number, color: string) =>
    `<path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) rotate(${((ang * 180) / Math.PI).toFixed(1)})" d="M0 0Q${(len * 0.5).toFixed(2)} ${(-len * 0.45).toFixed(2)} ${len.toFixed(2)} 0Q${(len * 0.5).toFixed(2)} ${(len * 0.3).toFixed(2)} 0 0Z" fill="${color}"/>`;
  const stem =
    `<path d="M${px} ${py.toFixed(2)}Q${(px + 2 * s).toFixed(2)} ${(py - 12 * s).toFixed(2)} ${tx} ${ty.toFixed(2)}" stroke="${colors[0]}" stroke-width="${(3 * s).toFixed(2)}" stroke-linecap="round" fill="none"/>` +
    leaf(26 * s, Math.PI + 0.5, colors[1]) +
    leaf(30 * s, -0.55, colors[0]);

  return dots + stem;
}

export function markSvg(): string {
  const dots = ball({ n: 150, r: 10.5, cx: 16, cy: 19.6, dot: [0.35, 0.6], fuzz: 0.06, sprout: 10.5 / 60, colors: [MOSS, LEAF] });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${dots}</svg>`;
}

// Specimen plate: the ball with a dashed growth ring and a leader to its note.
export function plateSvg(): string {
  const [cx, cy, r] = [200, 236, 118];
  const dots = ball({ n: 2200, r, cx, cy, dot: [0.8, 1.9], fuzz: 0.12, stray: 0.14, sprout: 1.1, colors: ['#35452F', '#8A9C72'] });
  const ring = r + 16;
  const lx = cx + ring * Math.cos(-0.5);
  const ly = cy + ring * Math.sin(-0.5);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 420">` +
    `<ellipse cx="${cx}" cy="${cy + r * 1.16}" rx="${r * 0.85}" ry="${r * 0.09}" fill="#35452F" fill-opacity=".08"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${ring}" fill="none" stroke="#586B46" stroke-opacity=".45" stroke-dasharray="2 5"/>` +
    dots +
    `<path d="M${lx.toFixed(1)} ${ly.toFixed(1)}L${lx + 28} ${ly - 46}H396" fill="none" stroke="#586B46" stroke-opacity=".7"/>` +
    `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.5" fill="#586B46"/>` +
    `</svg>`
  );
}
