import { dev } from './esbuilddefinitions';

export default function devLog(message: string | object): void {
  if (dev) {
    // eslint-disable-next-line no-console
    console.info(message);
  }
}
