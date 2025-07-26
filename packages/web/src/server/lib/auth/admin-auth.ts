import { requireAuth } from './server-action-auth';

/**
 * Check if a user has admin privileges
 */
function isAdmin(user: { email: string; id: string }): boolean {
	// Admin users - add more emails as needed
	const adminEmails = [
		'harthaaloufi@gmail.com'
	];
	
	return adminEmails.includes(user.email);
}

/**
 * Require admin authentication
 * Throws error if user is not authenticated or not an admin
 */
export async function requireAdmin() {
	const user = await requireAuth();
	
	if (!isAdmin(user)) {
		throw new Error('Admin access required');
	}
	
	return user;
}

/**
 * Check if current user is admin (non-throwing version)
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
	try {
		const user = await requireAuth();
		return isAdmin(user);
	} catch {
		return false;
	}
}