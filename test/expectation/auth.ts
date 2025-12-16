export function expectTokenResponseSucceed(result) {
  expect(result).toHaveProperty('accessToken');
  expect(result).toHaveProperty('refreshToken');
}

export function expectForgotPasswordResponseSucceed(result) {
  expect(result).toHaveProperty('newPassword');
}
