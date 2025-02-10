import { useMediaQuery } from "@uidotdev/usehooks";

export const useIsDesktop = () => {
  return useMediaQuery("(min-width: 1172px)");
}

export const useIsTablet = () => {
  return useMediaQuery("(min-width: 768px) and (max-width: 1171px)");
}

export const useIsMobile = () => {
  return useMediaQuery("(max-width: 767px)");
}