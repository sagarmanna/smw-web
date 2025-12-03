/**
 * Data fetching and processing functions for teacher tabs
 */

import type { UnavailabilityData } from '../teacherTabConfigs';
import { getTeacherUnavailability } from '../[id]/teachers-details-tabs.api';
import { transformUnavailabilityData } from './tabTransformers';

/**
 * Fetches and transforms unavailability data for a teacher
 */
export async function fetchUnavailabilityData(
  location: string,
  teacherId: number
): Promise<UnavailabilityData[]> {
  try {
    const apiResult = await getTeacherUnavailability(location, teacherId);
    if (apiResult && apiResult.length > 0) {
      const transformed = transformUnavailabilityData(apiResult);
      console.log('Transformed unavailability data:', transformed);
      return transformed;
    }
    return [];
  } catch (error) {
    console.error('Error fetching unavailability data:', error);
    // Continue with empty array if unavailability fetch fails
    return [];
  }
}

