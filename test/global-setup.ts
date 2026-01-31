import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
const globalAny: any = global;

export default async () => {
  console.log('Starting Postgres container...');
  const testContainer: StartedPostgreSqlContainer =
    await new PostgreSqlContainer('postgres:18')
      .withDatabase('test_mydb')
      .start();
  console.log('Postgres container started.');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  globalAny.__POSTGRES_CONTAINER__ = testContainer;

  // 환경 변수 설정 (기존에 TypeORM 세팅에 사용하던 키값들과 네이밍을 동일하게 할 것!)
  process.env.DB_TYPE = 'postgres';
  process.env.DB_HOST = testContainer.getHost();
  process.env.DB_PORT = testContainer.getPort().toString();
  process.env.DB_USER = testContainer.getUsername();
  process.env.DB_PASS = testContainer.getPassword();
  process.env.DB_NAME = testContainer.getDatabase();

  console.log('Global setup completed.');
};

/**
 "transformIgnorePatterns": [
   "/node_modules/(?!(@paralleldrive/cuid2|@noble/hashes)/)"
 ]

 > 
 node_modules는 기본적으로 변환하지 않되,
@paralleldrive/cuid2와 @noble/hashes만 예외로 변환해라


Jest는 기본적으로:
우리 코드(src, test) → transform 함 (ts-jest)
node_modules → transform ❌ (성능 때문에)


@paralleldrive/cuid2
@noble/hashes
같은 애들은 ESM-only 패키지야.

Jest는 CommonJS 환경이라
import 문을 그대로 만나면 바로 💥

옵션을 분해해보면 👇
node_modules 안에 있는 파일 중에서
👉 @paralleldrive/cuid2 또는 @noble/hashes가 아닌 것들은 무시하고
👉 이 두 패키지는 무시하지 말고 transform 해라
 */
