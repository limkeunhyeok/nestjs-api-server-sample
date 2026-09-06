import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';

export default async function setup() {
  console.log('Starting Postgres container...');
  const testContainer: StartedPostgreSqlContainer =
    await new PostgreSqlContainer('postgres:18')
      .withDatabase('test_mydb')
      .start();
  console.log('Postgres container started.');

  console.log('Starting Redis container...');
  const redisContainer: StartedRedisContainer = await new RedisContainer(
    'redis:8.4-alpine',
  ).start();
  console.log('Redis container started.');

  process.env.DB_TYPE = 'postgres';
  process.env.DB_HOST = testContainer.getHost();
  process.env.DB_PORT = testContainer.getPort().toString();
  process.env.DB_USER = testContainer.getUsername();
  process.env.DB_PASS = testContainer.getPassword();
  process.env.DB_NAME = testContainer.getDatabase();

  process.env.REDIS_HOST = redisContainer.getHost();
  process.env.REDIS_PORT = redisContainer.getPort().toString();

  console.log('Global setup completed.');

  return async () => {
    console.log('Stopping Postgres container...');
    await testContainer.stop();
    console.log('Stopping Redis container...');
    await redisContainer.stop();
    console.log('Global teardown completed.');
  };
}
