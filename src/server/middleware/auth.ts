// src/server/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../lib/auth/jwt';

export type AuthenticatedRequest = NextRequest & {
	user: {
		id: string;
		email: string;
	};
};

export async function withAuth(
	handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
	req: NextRequest
): Promise<NextResponse> {
	try {
		const token = req.headers.get('authorization')?.split(' ')[1];
		if (!token) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		const payload = verifyToken(token);
		(req as AuthenticatedRequest).user = {
			id: payload.userId,
			email: payload.email,
		};

		return handler(req as AuthenticatedRequest);
	} catch (error) {
		return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
	}
}
