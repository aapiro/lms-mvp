export const API_URL = (process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8080/api').replace(
  /\/$/,
  ''
);
