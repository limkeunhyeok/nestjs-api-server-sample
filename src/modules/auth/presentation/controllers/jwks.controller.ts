import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { JoseJwtService } from 'src/common/jose-jwt/jose-jwt.service';

@ApiTags('jwks')
@Public()
@Controller('/.well-known')
export class JwksController {
  constructor(private readonly joseJwtService: JoseJwtService) {}

  @Get('jwks.json')
  @Header('Cache-Control', 'public, max-age=3600')
  @Header('Content-Type', 'application/json')
  getJwks(): { keys: Record<string, unknown>[] } {
    return this.joseJwtService.getPublicJwks();
  }
}
