import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { JoseJwtService } from 'src/modules/jose-jwt/jose-jwt.service';

const ENV_PATH = resolve(process.cwd(), '.env');

function upsertEnv(key: string, value: string, env: string) {
  const line = `${key}=${value}`;
  const regex = new RegExp(`^${key}=.*$`, 'm');

  if (regex.test(env)) {
    return env.replace(regex, line);
  }

  return env.endsWith('\n') ? env + line + '\n' : env + '\n' + line + '\n';
}

async function main() {
  const { privateJwk, publicJwk } = await JoseJwtService.generateEs256Jwk();

  const privateValue = JSON.stringify(privateJwk);
  const publicValue = JSON.stringify(publicJwk);

  let env = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : '';

  env = upsertEnv('JWT_PRIVATE_JWK', `'${privateValue}'`, env);
  env = upsertEnv('JWT_PUBLIC_JWK', `'${publicValue}'`, env);

  writeFileSync(ENV_PATH, env, { encoding: 'utf-8' });

  console.log('JWT JWK keys have been written to .env');
}

main().catch((err) => {
  console.error('Failed to generate JWT keys', err);
  process.exit(1);
});
