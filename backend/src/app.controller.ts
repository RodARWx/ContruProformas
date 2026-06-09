import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  /** Endpoint de salud para Docker healthcheck y monitoreo del NAS */
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'construproformas-api' };
  }
}
