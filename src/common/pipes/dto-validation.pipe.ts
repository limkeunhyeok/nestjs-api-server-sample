import {
  BadRequestException,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmpty } from 'lodash';
import { NodeEnv, ServerEnv } from 'src/configurations/server.config';

@Injectable()
export class DtoValidationPipe extends ValidationPipe {
  constructor(configService: ConfigService<ServerEnv, true>) {
    const nodeEnv = configService.get<NodeEnv>('NODE_ENV');

    super({
      whitelist: true, // 정의된 속성만 허용하고 나머진 제거
      forbidNonWhitelisted: nodeEnv === NodeEnv.DEV, // 정의되지 않은 속성이 들어오면 에러
      transform: true, // 요청 객체를 DTO 클래스 인스턴스로 변환
      dismissDefaultMessages: nodeEnv === NodeEnv.PROD, // 여러 에러 메시지 중 첫번째 메시지만 출력
      stopAtFirstError: nodeEnv === NodeEnv.PROD, // 각 필드마다 에러나는 첫번째 데코레이터에서 멈춤(ex: @IsString에서 걸리면, 다음 @IsEmpty 같은 조건은 검사x)
      exceptionFactory: (errors) => {
        const messages = errors
          .map((e) => `${Object.values(e.constraints ?? {}).join(', ')}`)
          .filter((message) => !isEmpty(message))
          .join('; ');
        return new BadRequestException(messages);
      },
    });
  }
}
