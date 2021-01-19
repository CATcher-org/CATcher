import { uuid } from './uuid';

export function generateSessionId() {
  return `${Date.now()}-${uuid()}`;
}
