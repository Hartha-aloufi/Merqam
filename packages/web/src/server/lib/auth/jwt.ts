// src/server/lib/auth/jwt.ts
import jwt from 'jsonwebtoken';
import { env } from '@/server/config/env';
import { AuthTokenPayload } from '@/types/auth';

const JWT_EXPIRES_IN = '1d';

export function signToken(
	payload: Omit<AuthTokenPayload, 'iat' | 'exp'>
): string {
	return jwt.sign(payload, env.JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN,
		algorithm: 'HS256',
	});
}

export function verifyToken(token: string): AuthTokenPayload {
	return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}
