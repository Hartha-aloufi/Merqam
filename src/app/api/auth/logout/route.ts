// src/app/api/auth/logout/route.ts
import { TokenService } from '@/server/services/token.service';
import { NextResponse } from 'next/server';

const tokenService = new TokenService();

export async function POST(request: Request) {
	try {
		const { refreshToken } = await request.json();

		if (refreshToken) {
			await tokenService.revokeRefreshToken(refreshToken);
		}

		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json(
			{ error: 'فشل تسجيل الخروج' },
			{ status: 500 }
		);
	}
}
