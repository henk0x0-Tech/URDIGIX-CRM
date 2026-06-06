import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion?: number;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiry as any,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpiry as any,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, jwtConfig.accessTokenSecret, {
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  }) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, jwtConfig.refreshTokenSecret, {
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  }) as RefreshTokenPayload;
}
