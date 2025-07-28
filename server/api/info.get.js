import { version } from '../../package.json';

export default defineEventHandler(() => {
  return { version };
});
