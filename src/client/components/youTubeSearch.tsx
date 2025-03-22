'use client';

import { useState } from 'react';
import Search from '@/client/components/ui/search';
import { useRouter } from 'next/navigation';
import { findAndRedirectToLesson } from '@/app/actions/findAndRedirectToLesson';
import { toast } from 'sonner';

export default function YouTubeSearch() {
	const [isSearching, setIsSearching] = useState(false);
	const router = useRouter();

	const handleSearch = async (value: string) => {
		setIsSearching(true);

		try {
			const formData = new FormData();
			formData.set('youtubeUrl', value);

			const result = await findAndRedirectToLesson(formData);

			if (result?.error) {
				toast.error(result.error);
			} else if (result?.redirectUrl) {
				router.push(result.redirectUrl);
			} else {
				toast.error(result.error || 'حصلت مشكلة ما, حاول مرة اخرى');
			}
		} catch (error) {
			console.log('Search error:', error);
			toast.error('حدث خطأ أثناء البحث');
		} finally {
			setIsSearching(false);
		}
	};

	return (
		<div className="w-full max-w-xl mx-auto">
			<Search
				placeholder="ادخل رابط فيديو يوتيوب"
				onSearch={handleSearch}
				isLoading={isSearching}
			/>
			<p className="text-sm text-muted-foreground mt-2 text-center">
				أدخل رابط فيديو يوتيوب للعثور على الدرس المرتبط به
			</p>
		</div>
	);
}
