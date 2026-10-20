// The logo mark: a frozen, low-density frame of the hero moss ball (see orb.ts),
// rendered to SVG at build time. Used by Mark.astro and /favicon.svg.

const MOSS = '#3D6B45';
const LEAF = '#8DBF7A';

export function markSvg(): string {
  const N = 150;
  const R = 10.5;
  const [cx, cy] = [16, 19.6];
  const [a, tilt] = [0.6, 0.32];
  const [ca, sa, ct, st] = [Math.cos(a), Math.sin(a), Math.cos(tilt), Math.sin(tilt)];

  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const dots = Array.from({ length: N }, (_, i) => {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = i * Math.PI * (3 - Math.sqrt(5));
    const k = 1 + (rand() - 0.5) * 0.06;
    const light = rand() < 0.3;
    const [x, z] = [Math.cos(t) * r * k, Math.sin(t) * r * k];
    const x1 = x * ca + z * sa;
    const z1 = -x * sa + z * ca;
    const d = (y * k * st + z1 * ct + 1.2) / 2.4; // 0 = back, 1 = front
    return { x: cx + x1 * R, y: cy - (y * k * ct - z1 * st) * R, d, light };
  })
    .sort((p, q) => p.d - q.d) // back to front
    .map(
      (p) =>
        `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${(0.35 + p.d * 0.6).toFixed(2)}" fill="${p.light ? LEAF : MOSS}" fill-opacity="${(0.12 + p.d * 0.88).toFixed(2)}"/>`,
    )
    .join('');

  // Same sprout as the hero, scaled up so it reads at icon size.
  const s = R / 60;
  const px = cx;
  const py = cy - ct * R * 1.02;
  const [tx, ty] = [px, py - 24 * s];
  const leaf = (len: number, ang: number, color: string) =>
    `<path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) rotate(${((ang * 180) / Math.PI).toFixed(1)})" d="M0 0Q${(len * 0.5).toFixed(2)} ${(-len * 0.45).toFixed(2)} ${len.toFixed(2)} 0Q${(len * 0.5).toFixed(2)} ${(len * 0.3).toFixed(2)} 0 0Z" fill="${color}"/>`;
  const sprout =
    `<path d="M${px} ${py.toFixed(2)}Q${(px + 2 * s).toFixed(2)} ${(py - 12 * s).toFixed(2)} ${tx} ${ty.toFixed(2)}" stroke="${MOSS}" stroke-width="${(3 * s).toFixed(2)}" stroke-linecap="round" fill="none"/>` +
    leaf(26 * s, Math.PI + 0.5, LEAF) +
    leaf(30 * s, -0.55, MOSS);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${dots}${sprout}</svg>`;
}
