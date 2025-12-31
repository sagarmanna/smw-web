import { StaffMemberRow } from "../staffMembers.api";

/**
 * Mock history data for staff members
 */
export interface StaffMemberHistoryData {
  id: number;
  message: string;
  createdOn: string;
}

/**
 * Generate mock history data for a staff member
 */
export function generateStaffMemberHistory(staffMemberId: number): StaffMemberHistoryData[] {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30); // Start 30 days ago

  return [
    {
      id: staffMemberId * 1000 + 1,
      message: `Staff member profile created`,
      createdOn: new Date(baseDate.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: staffMemberId * 1000 + 2,
      message: `Email updated to ${staffMemberId % 2 === 0 ? 'work email' : 'personal email'}`,
      createdOn: new Date(baseDate.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: staffMemberId * 1000 + 3,
      message: `Phone number added`,
      createdOn: new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: staffMemberId * 1000 + 4,
      message: `Address information updated`,
      createdOn: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: staffMemberId * 1000 + 5,
      message: `Profile details modified`,
      createdOn: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

