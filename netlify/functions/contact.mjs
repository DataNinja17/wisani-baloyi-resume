import { handleContact } from '../lib/delivery.mjs';
export default function contact(request) {
  return handleContact(request, process.env);
}
export const config = {
  path: '/api/contact',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};