// Hero moss ball: a fibonacci-sphere point cloud with seeded radial jitter
// (the fuzzy edge) and a sprout at the north pole that sways a little.

const N = 1500;
const MOSS = '61,107,69';
const LEAF = '141,191,122';

export function mountOrb(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pts = Array.from({ length: N }, (_, i) => {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = i * Math.PI * (3 - Math.sqrt(5));
    const k = 1 + (rand() - 0.5) * 0.12 + (rand() < 0.06 ? rand() * 0.14 : 0);
    return { x: Math.cos(t) * r * k, y: y * k, z: Math.sin(t) * r * k, light: rand() < 0.3 };
  });

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;

  const leaf = (x: number, y: number, len: number, ang: number, color: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, -len * 0.45, len, 0);
    ctx.quadraticCurveTo(len * 0.5, len * 0.3, 0, 0);
    ctx.fill();
    ctx.restore();
  };

  const draw = (time: number) => {
    const a = time * 0.00012;
    const tilt = 0.32;
    const R = Math.min(w, h) * 0.3;
    const cx = w / 2;
    const cy = h * 0.54;
    const [ca, sa, ct, st] = [Math.cos(a), Math.sin(a), Math.cos(tilt), Math.sin(tilt)];

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // ground shadow
    const gy = cy + R * 1.18;
    const g = ctx.createRadialGradient(cx, gy, 0, cx, gy, R * 0.9);
    g.addColorStop(0, 'rgba(24,32,26,.14)');
    g.addColorStop(1, 'rgba(24,32,26,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, gy, R * 0.9, R * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    for (const p of pts) {
      const x1 = p.x * ca + p.z * sa;
      const z1 = -p.x * sa + p.z * ca;
      const y2 = p.y * ct - z1 * st;
      const d = (p.y * st + z1 * ct + 1.2) / 2.4; // 0 = back, 1 = front
      ctx.fillStyle = p.light ? `rgba(${LEAF},${0.15 + d * 0.85})` : `rgba(${MOSS},${0.08 + d * 0.9})`;
      ctx.beginPath();
      ctx.arc(cx + x1 * R, cy - y2 * R, 0.6 + d * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // sprout: the pole stays put under Y rotation, so it can be drawn flat
    const s = R / 120;
    const sway = Math.sin(time / 900) * 0.12;
    const px = cx;
    const py = cy - ct * R * 1.02;
    const tx = px + sway * 30 * s;
    const ty = py - 24 * s;
    ctx.strokeStyle = `rgb(${MOSS})`;
    ctx.lineWidth = 3 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + 2 * s, py - 12 * s, tx, ty);
    ctx.stroke();
    leaf(tx, ty, 26 * s, Math.PI + 0.5 + sway, `rgb(${LEAF})`);
    leaf(tx, ty, 30 * s, -0.55 + sway, `rgb(${MOSS})`);
  };

  const loop = (time: number) => {
    draw(time);
    raf = requestAnimationFrame(loop);
  };

  const resize = () => {
    dpr = devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    draw(performance.now());
  };

  new ResizeObserver(resize).observe(canvas);
  canvas.classList.add('ready');
  if (still) return;

  // Only animate while on screen.
  new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e?.isIntersecting) raf = requestAnimationFrame(loop);
  }).observe(canvas);
}
