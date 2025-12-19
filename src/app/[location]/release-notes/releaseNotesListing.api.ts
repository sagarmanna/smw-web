/**
 * Release Notes API file with mock data
 * Following the same pattern as studentsListing.api.ts and teachersListing.api.ts
 */

import type {
  ReleaseNoteRow,
  ReleaseNotesQuery,
  ReleaseNotesListResponse,
  CreateReleaseNoteRequest,
  CreateReleaseNoteResponse,
} from "./types";

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
} as const;

// Mock data based on the images provided - using HTML formatting
const MOCK_RELEASE_NOTES: ReleaseNoteRow[] = [
  {
    id: 1,
    subject: "Testing purpose dec 16",
    summary: "<p>Testing summary</p>",
    notes: "<p>testing notes</p>",
    scheduleDate: "Dec 16, 2025",
    createdDate: "Dec 16, 2025",
    userPublicIdentity: "seng",
  },
  {
    id: 2,
    subject: "test",
    summary: "<p>test</p>",
    notes: "<p>test</p>",
    scheduleDate: "Dec 16, 2025",
    createdDate: "Dec 16, 2025",
    userPublicIdentity: "seng",
  },
  {
    id: 3,
    subject: "Release 2.2.1",
    summary: "<p style='color: red; font-weight: bold; text-transform: uppercase;'><strong>EMERGENCY RELEASE - ACTION REQUIRED</strong>PLEASE CLICK READ MORE FOR DETAILS</p><p>A new field has been added to SMW to enter your company's HST number to be displayed on all invoices and receipts (Click read more)</p>",
    notes: "<p><strong>Background:</strong> The CRA (Canada Revenue Agency) requires that all Invoices and Receipts display the company's HST number on any invoices and receipts for any purchases greater than $30.00 and taxes are charged.</p><p><strong>Solution:</strong> SMW has been updated to now display your HST number on ALL invoices and receipts regardless of tax status. Given the financial and compliance implications, each location will be responsible for entering its own HST number into SMW. <strong>ONLY OWNERS</strong> will be able to make these changes.</p><p><strong>STEPS TO FIX:</strong></p><ol style='margin-left: 1.5rem; margin-top: 0.5rem;'><li style='margin-bottom: 0.25rem;'>Log into SMW under your Owners profile</li><li style='margin-bottom: 0.25rem;'>Click on 'Setup'</li><li style='margin-bottom: 0.25rem;'>Click on 'Location Settings'</li><li style='margin-bottom: 0.25rem;'>Add your HST number in the 'HST Registration Number' field' (Please pay very close attention to the information you enter. There is no system validation. If you enter the incorrect details, it will be displayed on your customer's invoices and receipts)</li></ol>",
    scheduleDate: "Jun 07, 2023",
    createdDate: "Jun 06, 2023",
    userPublicIdentity: "Giancarlo Macaluso",
  },
  {
    id: 4,
    subject: "Release 2.2.0",
    summary: "<p>On Wednesday, May 31 The following enhancement has been added:</p>",
    notes: "<p><strong>- Rental program</strong> The rental program has been added to SMW. This fully integrated rental program will automatically create invoices, generate contracts and new reporting has been introduced to manage your rental. A separate email to follow with the step by step guide on how to setup, create, manage, report and close contracts</p>",
    scheduleDate: "May 31, 2023",
    createdDate: "May 31, 2023",
    userPublicIdentity: "Giancarlo Macaluso",
  },
  {
    id: 5,
    subject: "Release 2.1.4",
    summary: "<p>On Wednesday, May 3rd a minor update has been made to the release news feature</p>",
    notes: "<p><strong>Update</strong> - The summary field in the release news will now allow for text editing.</p>",
    scheduleDate: "May 03, 2023",
    createdDate: "May 02, 2023",
    userPublicIdentity: "Giancarlo Macaluso",
  },
  {
    id: 6,
    subject: "Release 2.1.3",
    summary: "<p>On Wednesday, April 19th, The following bug has been fixed 1 - Lesson value reduced by 1 cent when discounts are applied</p>",
    notes: "<p><strong>Issue</strong> - When multiple discounts were applied to a customer profile for payment terms or multiple instruments/sibling discounts, the system was reducing the value of the individual lesson by 1 cent only if the lesson was invoiced and not paid. <strong>Resolution</strong> - A fix was applied across multiple areas of SMW to prevent the lesson from reducing by 1 cent. Please note that this fix does not work retroactively.</p>",
    scheduleDate: "Apr 18, 2023",
    createdDate: "Apr 14, 2023",
    userPublicIdentity: "Giancarlo Macaluso",
  },
  {
    id: 7,
    subject: "Release 2.1.2",
    summary: "<p>On Wednesday, March 22 the following bug fixes have been released: a fix was applied to the new release news notification feature</p>",
    notes: "<p><strong>Notes:</strong> <strong>Issue:</strong> The release news notification feature is displayed prior to the scheduled date. <strong>Resolved:</strong> The system will now display release news at the scheduled date</p>",
    scheduleDate: "Mar 22, 2023",
    createdDate: "Mar 20, 2023",
    userPublicIdentity: "Giancarlo Macaluso",
  },
  {
    id: 8,
    subject: "Release 2.1.1",
    summary: "<p>On Wednesday, March 15/23. The following changes have been released New Feature: Release News Popup Bug fix: Permanent reschedule change.</p>",
    notes: "<p><strong>New Feature: Release news popup.</strong></p><p>SMW administrative staff (not teachers) will now receive notification via a popup each time there is a new release. You will have three options to acknowledge the update.</p><p><strong>Option 1:</strong> 1 - Click 'OK' (This will close the release notification popup but it will reappear upon log-in to SMW or after 2 hours of inactivity).</p><p><strong>Option 2:</strong> 2- Click 'Do not show again' followed by 'OK' (This action will close the summary of the release notification popup and it will not reappear until new release news is added).</p><p><strong>Option 3:</strong> 3- Click 'Read More' (This action will bring you to the details of the release and the release notification popup will not reappear until new release news is added).</p><p>To review any release news added to the system, you will now see 'Release Notes' in the admin panel.</p><p><strong>Bug Fix:</strong></p><p><strong>Issue</strong> - Several locations reported that when permanently rescheduling a student's scheduled time and the new time is occupied by the same student, the system was producing an error message that the new spot is occupied. Example: Student A wants to permanently change their schedule to start 15 minutes later, because Student A already occupies the time slot the system would not allow the change. This issue is now resolved.</p>",
    scheduleDate: "Mar 15, 2023",
    createdDate: "Mar 14, 2023",
    userPublicIdentity: "Giancarlo Macaluso",
  },
];

// Helper to create empty response - DRY principle
const createEmptyReleaseNotesResponse = (): ReleaseNotesListResponse => ({
  success: false,
  message: "Failed to fetch release notes",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

/**
 * Mock implementation of getReleaseNotesList
 * Simulates API call with mock data and pagination
 */
export async function getReleaseNotesList(
  location: string,
  query: ReleaseNotesQuery
): Promise<ReleaseNotesListResponse> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const page = query.page || 1;
    const limit = query.limit || 20;

    // Filter by subject if provided
    let filteredNotes = MOCK_RELEASE_NOTES;
    if (query.subject) {
      filteredNotes = MOCK_RELEASE_NOTES.filter((note) =>
        note.subject.toLowerCase().includes(query.subject!.toLowerCase())
      );
    }

    // Sort if provided
    if (query.sort) {
      filteredNotes = [...filteredNotes].sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";

        if (query.sort === "subject") {
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
        } else if (query.sort === "scheduleDate") {
          aValue = new Date(a.scheduleDate).getTime();
          bValue = new Date(b.scheduleDate).getTime();
        } else if (query.sort === "createdDate") {
          aValue = new Date(a.createdDate).getTime();
          bValue = new Date(b.createdDate).getTime();
        }

        if (query.order === "desc") {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      });
    }

    // Calculate pagination
    const total = filteredNotes.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

    return {
      success: true,
      message: "Release notes fetched successfully",
      data: {
        body: paginatedNotes,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    const emptyResponse = createEmptyReleaseNotesResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch release notes";
    return emptyResponse;
  }
}

// Re-export types for convenience
export type {
  ReleaseNoteRow,
  ReleaseNotesQuery,
  ReleaseNotesListResponse,
  CreateReleaseNoteRequest,
  CreateReleaseNoteResponse,
} from "./types";

/**
 * Creates a new release note
 * 
 * @param location - Location parameter
 * @param data - Release note data (subject, summary, notes, scheduleDate)
 * @returns Promise resolving to create release note response
 * 
 * @example
 * ```typescript
 * const releaseNote = await createReleaseNote('location1', { 
 *   subject: 'Release 2.3.0', 
 *   summary: '<p>Summary content</p>',
 *   notes: '<p>Detailed notes</p>',
 *   scheduleDate: '2025-12-19'
 * });
 * ```
 */
export async function createReleaseNote(
  location: string,
  data: CreateReleaseNoteRequest
): Promise<CreateReleaseNoteResponse> {
  try {
    // TODO: Replace with actual API call when available
    // For now, simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Format dates to match the expected format (MMM dd, yyyy)
    const formatDate = (dateString: string): string => {
      // Handle both "yyyy-MM-dd" and other formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If parsing fails, try to parse as yyyy-MM-dd
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const day = parseInt(parts[2], 10);
          const dateObj = new Date(year, month, day);
          if (!isNaN(dateObj.getTime())) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const dayStr = dateObj.getDate().toString().padStart(2, '0');
            const monthStr = months[dateObj.getMonth()];
            const yearStr = dateObj.getFullYear();
            return `${monthStr} ${dayStr}, ${yearStr}`;
          }
        }
        // Fallback to original string if all parsing fails
        return dateString;
      }
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate().toString().padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    };
    
    const now = new Date();
    const scheduleDateFormatted = formatDate(data.scheduleDate);
    const createdDateFormatted = formatDate(now.toISOString().split('T')[0]);
    
    // Generate a new ID (get the max ID and add 1)
    const maxId = MOCK_RELEASE_NOTES.length > 0 
      ? Math.max(...MOCK_RELEASE_NOTES.map(note => note.id))
      : 0;
    const newId = maxId + 1;
    
    // Create the new release note
    const newReleaseNote: ReleaseNoteRow = {
      id: newId,
      subject: data.subject,
      summary: data.summary,
      notes: data.notes,
      scheduleDate: scheduleDateFormatted,
      createdDate: createdDateFormatted,
      userPublicIdentity: "Current User",
    };
    
    // Add to the beginning of the array so it appears first
    MOCK_RELEASE_NOTES.unshift(newReleaseNote);
    
    // Mock response - in production, this would be an actual API call
    return {
      success: true,
      message: "Release note created successfully",
      data: {
        id: newReleaseNote.id,
        subject: newReleaseNote.subject,
        summary: newReleaseNote.summary,
        notes: newReleaseNote.notes,
        scheduleDate: newReleaseNote.scheduleDate,
        createdDate: newReleaseNote.createdDate,
        userPublicIdentity: newReleaseNote.userPublicIdentity,
      },
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: CreateReleaseNoteResponse } };
    console.error("Error creating release note:", error);
    throw {
      message: apiError.response?.data?.message || "Failed to create release note",
      errorCode: apiError.response?.data?.success === false ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
    };
  }
}

