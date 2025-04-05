// src/server/config/auth.ts
import { env } from './env';

export const GOOGLE_OAUTH_CONFIG = {
	client_id: env.GOOGLE_CLIENT_ID,
	client_secret: env.GOOGLE_CLIENT_SECRET,
	redirect_uri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
	scope: [
		'https://www.googleapis.com/auth/userinfo.email',
		'https://www.googleapis.com/auth/userinfo.profile',
	].join(' '),
};

export const AUTH_COOKIE_CONFIG = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax' as const,
	path: '/',
	maxAge: 30 * 24 * 60 * 60, // 30 days
};
