import { initE2ETest } from 'test/lib/init-e2e-test';

describe('Jwks API Test', () => {
  const ctx = initE2ETest(async () => {});

  describe('GET /.well-known/jwks.json', () => {
    const rootApiPath = '/.well-known/jwks.json';

    it('should return 200 and a list of public keys', async () => {
      // when
      const res = await ctx.req.get(rootApiPath).expect(200);

      // then
      const body = res.body;
      expect(body).toBeDefined();
      expect(body.keys).toBeDefined();
      expect(Array.isArray(body.keys)).toBe(true);
      expect(body.keys.length).toBeGreaterThan(0);
      
      const key = body.keys[0];
      expect(key.kty).toBeDefined();
      expect(key.kid).toBeDefined();
      expect(key.use).toBe('sig');
      expect(key.alg).toBeDefined();
      // d (private exponent) should not be exported in public keys
      expect(key.d).toBeUndefined();
    });
  });
});
