import { Request, Response } from 'express';

const startTime = Date.now();

export const healthController = {
  getHealth: (_req: Request, res: Response) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const timestamp = new Date().toISOString();

    res.status(200).json({
      status: 'ok',
      uptime,
      timestamp,
    });
  },
};
