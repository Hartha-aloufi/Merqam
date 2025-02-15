import { useMediaQuery } from 'usehooks-ts';

export const useIsDesktop = () => {
	// if ssr then return true
	return useMediaQuery('(min-width: 1172px)', { initializeWithValue: false });
};

export const useIsTablet = () => {
	return useMediaQuery('(min-width: 768px) and (max-width: 1171px)', {
		initializeWithValue: false,
	});
};

export const useIsMobile = () => {
	return useMediaQuery('(max-width: 767px)', { initializeWithValue: false });
};
