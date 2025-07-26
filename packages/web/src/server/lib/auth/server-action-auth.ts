// src/server/lib/auth/server-action-auth.ts
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

export interface AuthenticatedUser {
	id: string;
	email: string;
}

/**
 * Get authenticated user from server action context
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
	try {
		const cookieStore = cookies();
		const accessToken = cookieStore.get('access_token')?.value;
		
		if (!accessToken) {
			return null;
		}
		
		const payload = verifyToken(accessToken);
		return {
			id: payload.userId,
			email: payload.email,
		};
	} catch (error) {
		console.error('Server action auth error:', error);
		return null;
	}
}

/**
 * Require authentication in server actions
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
	const user = await getAuthenticatedUser();
	if (!user) {
		throw new Error('Authentication required');
	}
	return user;
}

/**
 * Check if user is authenticated in server actions
 */
export async function isAuthenticated(): Promise<boolean> {
	const user = await getAuthenticatedUser();
	return user !== null;
}