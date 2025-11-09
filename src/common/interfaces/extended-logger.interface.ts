import { LoggerService } from '@nestjs/common';

// winston 구성 시 levels 설정으로 특정 메서드가 분명히 있으나, 기본 인터페이스상 옵셔널
export interface ExtendedLogger extends LoggerService {
  fatal(message: any, ...optionalParams: any[]): any;
  error(message: any, ...optionalParams: any[]): any;
  warn(message: any, ...optionalParams: any[]): any;
  verbose(message: any, ...optionalParams: any[]): any;
  debug(message: any, ...optionalParams: any[]): any;
}
