import worker, { Env } from '../../cloudflare/worker';

export const onRequest = async (context: { request: Request; env: Env }) => {
  return worker.fetch(context.request, context.env, {
    waitUntil: () => {},
    passThroughOnException: () => {},
  });
};
