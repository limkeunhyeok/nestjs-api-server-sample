export function expectTokenResponseSucceed(result) {
  expect(result).toHaveProperty('accessToken');
}

export function expectVerifyResponseSucceed(result, isSuccess?: boolean) {
  expect(result).toHaveProperty('success');
  expect(result).toHaveProperty('message');

  if (isSuccess !== undefined) {
    expect(result.success).toBe(isSuccess);
  }
}
