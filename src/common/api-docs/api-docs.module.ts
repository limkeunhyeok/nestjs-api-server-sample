import { INestApplication, Module } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { ApiDocsOptions, getSwaggerConfig } from './api-docs.config';

@Module({})
export class ApiDocsModule {
  static register(app: INestApplication, apiDocsOptions: ApiDocsOptions) {
    const config = getSwaggerConfig(apiDocsOptions);
    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api-docs', app, document);
  }
}
