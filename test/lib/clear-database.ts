import { DataSource } from 'typeorm';

export async function clearDatabase(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // FK 제약 비활성화
    await queryRunner.query(`SET session_replication_role = 'replica';`);

    for (const entity of dataSource.entityMetadatas) {
      const tableName = entity.tableName;
      await queryRunner.query(
        `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`,
      );
    }

    // FK 제약 복구
    await queryRunner.query(`SET session_replication_role = 'origin';`);

    await queryRunner.commitTransaction();
  } catch (e) {
    await queryRunner.rollbackTransaction();
    throw e;
  } finally {
    await queryRunner.release();
  }
}
