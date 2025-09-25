"use client";

import { getFeatureSource } from '@/utils/locationFlags';

export function useLocationFeatures() {
  // Get the feature source for a location
  const getFeatureSourceForLocation = (locationSlug: string, feature: string): 'modern' | 'legacy' => {
    return getFeatureSource(locationSlug, feature);
  };

  return {
    getFeatureSourceForLocation,
  };
}
