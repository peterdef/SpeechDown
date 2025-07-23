import app from './app';
import { NowRequest, NowResponse } from '@vercel/node';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Server } from 'http';
import { AddressInfo } from 'net';

let server: Server | null = null;

export default async function handler(req: NowRequest, res: NowResponse) {
  if (!server) {
    server = createServer(app);
    await new Promise<void>((resolve) => {
      server!.listen(0, resolve);
    });
  }
  const address = server.address() as AddressInfo;
  const port = address.port;
  req.url = req.url || '/';
  const proxyReq = new IncomingMessage(req.socket);
  proxyReq.url = req.url;
  proxyReq.method = req.method;
  proxyReq.headers = req.headers;
  server.emit('request', proxyReq, res as unknown as ServerResponse);
} 