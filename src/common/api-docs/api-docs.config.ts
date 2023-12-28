import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

export interface ApiDocsOptions {
  title: string;
  description: string;
  version: string;
}

export const getSwaggerConfig = ({
  title,
  description,
  version,
}: ApiDocsOptions): Omit<OpenAPIObject, 'paths'> => {
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
        in: 'header',
      },
      'accessToken',
    )
    .build();
  return config;
};
