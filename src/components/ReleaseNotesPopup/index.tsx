"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import DOMPurify from "dompurify";
import { useAppSelector } from "@/redux/hooks";

interface ReleaseNote {
  id: number;
  subject: string;
  summary: string;
  notes: string;
  scheduleDate: string;
  date: string;
  userId: number;
  readId?: number;
  isRead?: number;
}

interface ReleaseNotesPopupProps {
  location: string;
}

export function ReleaseNotesPopup({ location }: ReleaseNotesPopupProps) {
  const { userInfo } = useAppSelector((state) => state.user);
  const [isOpen, setIsOpen] = React.useState(false);
  const [releaseNote, setReleaseNote] = React.useState<ReleaseNote | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Don't show popup for admins - they have full access to release notes page
  const isAdmin = userInfo?.role === 'administrator';

  // Check for unread release notes on mount and when user info changes
  React.useEffect(() => {
    // Skip popup for admins - they can see all notes in the listing page
    if (!userInfo?.id || isAdmin) return;

    const checkForUnreadNotes = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<{
          success: boolean;
          data: ReleaseNote | null;
          message: string;
        }>(`/admin/v2/${location}/release-notes/read/${userInfo.id}`);

        if (response.data.success && response.data.data) {
          setReleaseNote(response.data.data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error fetching unread release notes:", error);
        // Silently fail - don't show popup if there's an error
      } finally {
        setIsLoading(false);
      }
    };

    checkForUnreadNotes();
  }, [location, userInfo?.id, isAdmin]);

  const handleOk = async (markAsRead: boolean) => {
    if (!userInfo?.id || !releaseNote) return;

    try {
      setIsUpdating(true);
      await apiClient.post(`/admin/v2/${location}/release-notes/popup-ok`, {
        userId: userInfo.id,
        isRead: markAsRead,
      });

      setIsOpen(false);
      setReleaseNote(null);
    } catch (error) {
      console.error("Error updating read status:", error);
      // Still close the popup even if update fails
      setIsOpen(false);
      setReleaseNote(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const sanitizeHtml = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "s",
        "a",
        "span",
        "div",
        "b",
        "i",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "sub",
        "sup",
        "mark",
      ],
      ALLOWED_ATTR: ["href", "target", "rel", "style", "data-color"],
      ALLOW_DATA_ATTR: true,
    });
  };

  if (!releaseNote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{releaseNote.subject}</DialogTitle>
          <DialogDescription>
            Release Note - {new Date(releaseNote.scheduleDate).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {releaseNote.summary && (
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <div
                className="text-sm [&_strong]:font-semibold [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_p]:leading-[1.6] break-words whitespace-normal"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(releaseNote.summary),
                }}
              />
            </div>
          )}

          {releaseNote.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <div
                className="text-sm text-muted-foreground [&_strong]:font-semibold [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:leading-[1.6] break-words whitespace-normal [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mt-1.5 [&_ol]:mb-1.5 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mt-1.5 [&_ul]:mb-1.5 [&_li]:mb-1 [&_li]:leading-[1.6] [&_li]:pl-1"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(releaseNote.notes),
                }}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOk(false)}
            disabled={isUpdating}
          >
            Close
          </Button>
          <Button
            onClick={() => handleOk(true)}
            disabled={isUpdating}
            className="bg-primary hover:bg-primary/90"
          >
            {isUpdating ? "Processing..." : "OK, Don't Show Again"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

