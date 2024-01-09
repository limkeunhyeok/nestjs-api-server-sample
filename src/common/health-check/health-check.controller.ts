import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health-check')
@Controller('health-check')
export class HealthCheckController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get('/server')
  @HealthCheck()
  healthCheck() {
    return {
      status: 'ok',
      info: {
        server: {
          status: 'up',
        },
      },
      error: {},
      details: {
        server: {
          status: 'up',
        },
      },
    };
  }

  @Get('/http')
  @HealthCheck()
  httpCheck() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }

  @Get('/db')
  @HealthCheck()
  dbCheck() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
