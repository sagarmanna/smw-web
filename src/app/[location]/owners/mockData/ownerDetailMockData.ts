// This file only contains history-related mock data generation
// The main mock data store and functions are in owners-details.api.ts

/**
 * Generate mock history data for an owner
 */
export interface OwnerHistoryData {
  id: number;
  message: string;
  createdOn: string;
}

export function generateOwnerHistory(ownerId: number): OwnerHistoryData[] {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30); // Start 30 days ago

  return [
    {
      id: ownerId * 1000 + 1,
      message: `Owner profile created`,
      createdOn: new Date(baseDate.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: ownerId * 1000 + 2,
      message: `Email updated to ${ownerId % 2 === 0 ? 'work email' : 'personal email'}`,
      createdOn: new Date(baseDate.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: ownerId * 1000 + 3,
      message: `Phone number added`,
      createdOn: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: ownerId * 1000 + 4,
      message: `Address information updated`,
      createdOn: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: ownerId * 1000 + 5,
      message: `Profile details modified`,
      createdOn: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

