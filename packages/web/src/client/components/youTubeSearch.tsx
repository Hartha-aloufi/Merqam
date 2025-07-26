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

	const isValidYouTubeVideoId = (videoId: string) => {
		// YouTube video IDs are typically 11 characters long and contain alphanumeric characters, hyphens, and underscores
		const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
		return videoIdRegex.test(videoId);
	};

	const isValidYouTubeUrl = (url: string) => {
		try {
			const urlObj = new URL(url);
			const hostname = urlObj.hostname.toLowerCase();
			
			// Check for valid YouTube domains
			return (
				hostname === 'youtube.com' ||
				hostname === 'www.youtube.com' ||
				hostname === 'youtu.be' ||
				hostname === 'm.youtube.com'
			);
		} catch {
			return false;
		}
	};

	const extractVideoId = (input: string): string | null => {
		const trimmedInput = input.trim();
		
		// If input looks like a video ID directly (11 characters, alphanumeric + _ -)
		if (isValidYouTubeVideoId(trimmedInput)) {
			return trimmedInput;
		}

		// If it's not a valid YouTube URL, return null
		if (!isValidYouTubeUrl(trimmedInput)) {
			return null;
		}

		try {
			// Handle youtu.be URLs
			if (trimmedInput.includes('youtu.be')) {
				const videoId = trimmedInput.split('/').pop()?.split('?')[0] || '';
				return isValidYouTubeVideoId(videoId) ? videoId : null;
			}

			// Handle youtube.com URLs
			const urlObj = new URL(trimmedInput);
			const videoId = urlObj.searchParams.get('v') || '';
			return isValidYouTubeVideoId(videoId) ? videoId : null;
		} catch {
			return null;
		}
	};

	const handleSearch = async (value: string) => {
		setIsSearching(true);

		try {
			// Validate input
			if (!value.trim()) {
				toast.error('الرجاء إدخال رابط يوتيوب أو معرف الفيديو');
				setIsSearching(false);
				return;
			}

			const videoId = extractVideoId(value);

			if (!videoId) {
				toast.error('الرجاء إدخال رابط يوتيوب صحيح أو معرف فيديو صالح');
				setIsSearching(false);
				return;
			}

			// Redirect to the request page with the video ID
			router.push(`/request/${videoId}`);
		} catch (error) {
			console.log('Search error:', error);
			toast.error('حدث خطأ أثناء البحث');
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
