import { markSvg } from '../scripts/mark';

export const GET = () => new Response(markSvg(), { headers: { 'Content-Type': 'image/svg+xml' } });
