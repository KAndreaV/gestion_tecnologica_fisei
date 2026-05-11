import { Controller, Get } from '@nestjs/common';

@Controller()
export class TestController {
  @Get()
  hello() {
    return {
      message: 'Backend funcionando 🚀',
    };
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date(),
    };
  }
}