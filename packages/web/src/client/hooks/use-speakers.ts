// src/client/hooks/use-speakers.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { BahethClient, Speaker } from '../services/baheth.service';

const bahethClient = new BahethClient();
const ITEMS_PER_PAGE = 12;

// Generate placeholder data
const generatePlaceholderSpeaker = (id: number): Speaker => ({
	id,
	slug: '',
	name: '',
	description: '',
	image: '',
	playlists_count: 0,
	external_link: '',
	baheth_link: '',
});

const placeholderPage = {
	count: ITEMS_PER_PAGE,
	page: 1,
	limit: ITEMS_PER_PAGE,
	total_pages: 1,
	next_page: null,
	previous_page: null,
	speakers: Array.from({ length: ITEMS_PER_PAGE }, (_, i) =>
		generatePlaceholderSpeaker(i)
	),
};

export function useSpeakers(query: string = '') {
	return useInfiniteQuery({
		queryKey: ['speakers', query],
		queryFn: ({ pageParam = 1 }) =>
			bahethClient.searchSpeakers(query, pageParam, ITEMS_PER_PAGE),
		getNextPageParam: (lastPage) => lastPage.next_page ?? undefined,
		placeholderData: {
			pages: [placeholderPage],
			pageParams: [1],
		},
		initialPageParam: 1,
	});
}
