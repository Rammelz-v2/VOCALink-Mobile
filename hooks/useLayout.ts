import { useWindowDimensions } from "react-native";

export function useLayout() {
  const { width: sw, height: sh } = useWindowDimensions();

  const isLandscape = sw > sh;
  const isTablet    = sw >= 768;

  // AAC grid columns
  const aacCols = isTablet
    ? (isLandscape ? 6 : 5)
    : (isLandscape ? 4 : 3);

  // Scale factor relative to a 390px baseline phone
  const scale = Math.min(sw / 390, 1.35);

  // Horizontal padding that grows on large screens
  const hPad = isTablet ? 28 : 16;

  // Bottom nav height (used to position floating pills above it)
  const navHeight = isTablet ? 76 : (isLandscape ? 54 : 64);

  return { sw, sh, isLandscape, isTablet, aacCols, scale, hPad, navHeight };
}
