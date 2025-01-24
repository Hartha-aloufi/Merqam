import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../lib/auth/jwt';

export type AuthenticatedRequest = NextRequest & {
	user: {
		id: string;
		email: string;
	};
};

export async function withAuth(
	handler: (
		req: AuthenticatedRequest,
		context?: any
	) => Promise<NextResponse>,
	req: NextRequest,
	context?: any
): Promise<NextResponse> {
	try {
		const accessToken = req.cookies.get('access_token')?.value;

		if (!accessToken) {
			return NextResponse.json(
				{ error: 'Authentication required' },
				{ status: 401 }
			);
		}

		try {
			const payload = verifyToken(accessToken);
			(req as AuthenticatedRequest).user = {
				id: payload.userId,
				email: payload.email,
			};

			return handler(req as AuthenticatedRequest, context);
		} catch (error) {
			console.error('Token verification failed:', error);
			return NextResponse.json(
				{ error: 'Invalid or expired token' },
				{ status: 401 }
			);
		}
	} catch (error) {
		console.error('Auth middleware error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
