import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHome(): object {
    return {
      message: 'Backend funcionando correctamente',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  }

  getHealth(): object {
    return {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}
