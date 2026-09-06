import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TestService {
  constructor(private readonly dataSource: DataSource) {}

  public async cleanDatabase(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entities = this.dataSource.entityMetadatas;
      await queryRunner.query(`SET session_replication_role = 'replica';`); // TypeORM이 가지고 있는 Entity 목록

      // 외래키 제약조건 임시 비활성화
      for (const entity of entities) {
        await queryRunner.query(
          `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`,
        );
      }

      await queryRunner.query(`SET session_replication_role = 'origin';`);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`ERROR: Cleaning test database: ${error}`);
    } finally {
      await queryRunner.release();
    }
  }
}
