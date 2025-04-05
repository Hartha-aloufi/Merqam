// src/server/lib/validation/auth.ts
import { z } from 'zod';

export const registerSchema = z.object({
	email: z.string().email('الرجاء إدخال بريد إلكتروني صحيح'),
	password: z
		.string()
		.min(8, 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
			'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم وعلامة خاصة'
		),
	name: z.string().optional(),
});

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'البريد الإلكتروني مطلوب')
		.email('الرجاء إدخال بريد إلكتروني صحيح'),
	password: z
		.string()
		.min(1, 'كلمة المرور مطلوبة')
		.min(8, 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
