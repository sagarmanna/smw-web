"use client";

import { useAppSelector } from '@/redux/hooks';

const globallyModernFeatures = new Set([
  'rental',
  'financialSummaryReport',
  'itemCategory',
]);

export function useLocationFeatures() {
  const { flags, isLoading } = useAppSelector((state) => state.locationFlags);
  
  // Get the feature source for a location from Redux state
  const getFeatureSourceForLocation = (locationSlug: string, feature: string): 'modern' | 'legacy' => {
    const locationFlags = flags[locationSlug] || {};
    const featureFlag = locationFlags[feature];
    const source =
      globallyModernFeatures.has(feature) || featureFlag === 'modern'
        ? 'modern'
        : 'legacy';

    return source;
  };

  return {
    getFeatureSourceForLocation,
    flags,
    isLoading,
  };
}
