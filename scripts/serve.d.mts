import type { Server } from "node:http";
export function startServer(options: {
  directory: string;
  port?: number;
  basePath?: string;
  open?: boolean;
}): Promise<Server>;
export function openBrowser(url: string): void;
