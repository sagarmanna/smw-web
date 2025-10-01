"use client";

import { useAppSelector } from '@/redux/hooks';

export function useLocationFeatures() {
  const { flags, isLoading } = useAppSelector((state) => state.locationFlags);
  
  // Get the feature source for a location from Redux state
  const getFeatureSourceForLocation = (locationSlug: string, feature: string): 'modern' | 'legacy' => {
    const locationFlags = flags[locationSlug] || {};
    const featureFlag = locationFlags[feature];
    
    return featureFlag === 'modern' ? 'modern' : 'legacy';
  };

  return {
    getFeatureSourceForLocation,
    flags,
    isLoading,
  };
}
