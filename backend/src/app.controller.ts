import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { HealthService } from './health/health.service';

@Controller()
export class AppController {
  constructor(private readonly healthService: HealthService) {}

  /** Endpoint de salud para Docker healthcheck y monitoreo del NAS */
  @Public()
  @Get('health')
  async health() {
    return this.healthService.getReport();
  }
}
