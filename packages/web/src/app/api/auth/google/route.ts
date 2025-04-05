// src/app/api/auth/google/route.ts
import { NextResponse } from 'next/server';
import { GOOGLE_OAUTH_CONFIG } from '@/server/config/auth';

export async function GET() {
	const queryParams = new URLSearchParams({
		client_id: GOOGLE_OAUTH_CONFIG.client_id,
		redirect_uri: GOOGLE_OAUTH_CONFIG.redirect_uri,
		response_type: 'code',
		scope: GOOGLE_OAUTH_CONFIG.scope,
		access_type: 'offline',
		prompt: 'consent',
	});

	const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryParams}`;
	return NextResponse.json({ url: authUrl });
}
