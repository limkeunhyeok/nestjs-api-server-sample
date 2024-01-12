import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PostService {
  constructor(private readonly datasource: DataSource) {}
}
