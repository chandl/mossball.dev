// Hero moss ball, animated: the plate's stippled sphere (see mark.ts) slowly
// turning, with the sprout swaying a little. Draws in the plate's viewBox
// units so it lines up with the static SVG it replaces.

import { PLATE, PLATE_SIZE, project, spherePoints, sproutPaths } from './mark';

export function mountOrb(canvas: HTMLCanvasElement, onReady: () => void) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { r, cx, cy, dot, colors } = PLATE;
  const pts = spherePoints(PLATE);
  let scale = 1;
  let raf = 0;

  const draw = (time: number) => {
    const a = 0.6 + time * 0.00012;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, PLATE_SIZE[0], PLATE_SIZE[1]);

    for (const p of pts) {
      const q = project(p, a);
      ctx.globalAlpha = 0.12 + q.d * 0.88;
      ctx.fillStyle = p.light ? colors[1] : colors[0];
      ctx.beginPath();
      ctx.arc(cx + q.x * r, cy - q.y * r, dot[0] + q.d * dot[1], 0, Math.PI * 2);
      ctx.fill();
    }

    // the pole stays put under Y rotation, so the sprout can be drawn flat
    const sp = sproutPaths(PLATE, Math.sin(time / 900) * 0.12);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = sp.width;
    ctx.lineCap = 'round';
    ctx.stroke(new Path2D(sp.stem));
    for (const l of sp.leaves) {
      ctx.fillStyle = l.fill;
      ctx.fill(new Path2D(l.d));
    }
  };

  const loop = (time: number) => {
    draw(time);
    raf = requestAnimationFrame(loop);
  };

  new ResizeObserver(() => {
    const dpr = devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    scale = (canvas.clientWidth / PLATE_SIZE[0]) * dpr;
    draw(performance.now());
  }).observe(canvas);
  onReady();

  // Only animate while on screen.
  new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e?.isIntersecting) raf = requestAnimationFrame(loop);
  }).observe(canvas);
}
