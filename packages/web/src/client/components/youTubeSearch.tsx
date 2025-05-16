'use client';

import { useState, useEffect } from 'react';
import Search from '@/client/components/ui/search';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function YouTubeSearch() {
	const [isSearching, setIsSearching] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const error = searchParams.get('error');
		if (error) {
			toast.error(decodeURIComponent(error));
		}
	}, [searchParams]);

	const extractVideoId = (url: string) => {
		// If it's just a video ID, return it directly
		if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
			return url;
		}

		// Handle youtu.be URLs
		if (url.includes('youtu.be')) {
			return url.split('/').pop()?.split('?')[0];
		}

		// Handle youtube.com URLs
		const urlObj = new URL(url);
		return urlObj.searchParams.get('v');
	};

	const handleSearch = async (value: string) => {
		setIsSearching(true);

		try {
			const videoId = extractVideoId(value);

			if (!videoId) {
				toast.error('الرجاء إدخال رابط يوتيوب صحيح');
				return;
			}

			// Redirect to the request page with the video ID
			router.push(`/request/${videoId}`);
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
				placeholder="ادخل رابط فيديو يوتيوب أو معرف الفيديو"
				onSearch={handleSearch}
				isLoading={isSearching}
			/>
			<p className="text-sm text-muted-foreground mt-2 text-center">
				أدخل رابط فيديو يوتيوب أو معرف الفيديو للعثور على الدرس المرتبط
				به
			</p>
		</div>
	);
}
