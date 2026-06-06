export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'urdigix-access-secret-key-2024',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'urdigix-refresh-secret-key-2024',
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  issuer: 'urdigix-erp',
  audience: 'urdigix-clients',
};
