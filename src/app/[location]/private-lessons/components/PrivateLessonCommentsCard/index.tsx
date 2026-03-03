"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, User } from "lucide-react";
import { PrivateLessonComment } from "../../types";

interface PrivateLessonCommentsCardProps {
  comments?: PrivateLessonComment[];
  isLoading?: boolean;
  commentsError?: string | null;
  pagination?: { page: number; limit: number; total: number; totalPages: number } | null;
  onPageChange?: (page: number) => void;
  onAddComment?: (content: string) => Promise<boolean>;
  isSubmitting?: boolean;
}

const CommentItem = ({ comment }: { comment: PrivateLessonComment }) => {
  const [imageError, setImageError] = React.useState(false);

  // Construct avatar URL - if it's a relative path, prepend legacy base URL
  const getAvatarUrl = () => {
    if (!comment.avatar) return null;
    // If already a full URL, use as-is
    if (comment.avatar.startsWith('http://') || comment.avatar.startsWith('https://')) {
      return comment.avatar;
    }
    // If relative path, prepend legacy base URL
    const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || '';
    return legacyBase && !comment.avatar.startsWith('/') 
      ? `${legacyBase}/${comment.avatar}`
      : comment.avatar;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
      <div className="flex-shrink-0">
        {avatarUrl && !imageError ? (
          <img 
            src={avatarUrl} 
            alt={comment.createdUser}
            className="h-8 w-8 rounded-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{comment.createdUser}</p>
          <p className="text-xs text-muted-foreground">{comment.createdOn}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
      </div>
    </div>
  );
};

export const PrivateLessonCommentsCard = React.memo(function PrivateLessonCommentsCard({
  comments = [],
  isLoading = false,
  commentsError,
  pagination,
  onPageChange,
  onAddComment,
  isSubmitting = false,
}: PrivateLessonCommentsCardProps) {
  const [message, setMessage] = React.useState("");
  const [commentError, setCommentError] = React.useState<string | null>(null);

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || 0;
  const rowsPerPage = pagination?.limit || 10;

  const handleSendMessage = React.useCallback(async () => {
    if (!message.trim()) {
      setCommentError("Content cannot be blank.");
      return;
    }

    if (!onAddComment) {
      toast.error("Comment action is unavailable");
      return;
    }

    const success = await onAddComment(message.trim());
    if (success) {
      setMessage("");
      setCommentError(null);
    }
  }, [message, onAddComment]);

  const commentsContent = (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
      ) : commentsError ? (
        <div className="text-center py-8 text-red-500">Error: {commentsError}</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No results found.
        </div>
      ) : (
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );

  const commentsBottomContent = (
    <>
      <div className="mt-4 flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Type message"
          className="flex-grow"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (commentError) setCommentError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && message.trim() && !isSubmitting) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isSubmitting}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={!message.trim() || isSubmitting}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {commentError && (
        <div className="text-sm text-red-500 mt-1">
          {commentError}
        </div>
      )}
    </>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {commentsContent}
        {totalRows > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {commentsBottomContent}
      </CardContent>
    </Card>
  );
});

