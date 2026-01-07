"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { InvoiceComment } from "../../mockData/invoiceDetailMockData";
import { TOAST_MESSAGES } from "../../utils/constants";

interface InvoiceCommentsCardProps {
  comments?: InvoiceComment[];
  isLoading?: boolean;
  onAddComment?: (content: string) => void;
}

// Comment item component with avatar error handling
const CommentItem = React.memo(({ comment }: { comment: InvoiceComment }) => {
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
      ? `${legacyBase}${comment.avatar.startsWith('/') ? '' : '/'}${comment.avatar}`
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
});

CommentItem.displayName = "CommentItem";

export const InvoiceCommentsCard = React.memo(function InvoiceCommentsCard({
  comments = [],
  isLoading = false,
  onAddComment,
}: InvoiceCommentsCardProps) {
  const [commentInput, setCommentInput] = React.useState<string>("");
  const [commentLoading, setCommentLoading] = React.useState<boolean>(false);
  const [commentError, setCommentError] = React.useState<string | null>(null);

  const handleAddComment = React.useCallback(async () => {
    if (!commentInput.trim()) {
      setCommentError(TOAST_MESSAGES.ERROR.CONTENT_REQUIRED);
      return;
    }

    if (!onAddComment) {
      return;
    }

    try {
      setCommentLoading(true);
      setCommentError(null);
      
      // Call the handler (which will handle the API call and state update)
      await onAddComment(commentInput.trim());
      setCommentInput("");
      setCommentError(null);
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message ||
        (error as { errorCode?: string; message?: string })?.message ||
        "Failed to create comment";
      setCommentError(errorMessage);
    } finally {
      setCommentLoading(false);
    }
  }, [commentInput, onAddComment]);

  const commentsContent = (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
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
          value={commentInput}
          onChange={(e) => {
            setCommentInput(e.target.value);
            if (commentError) setCommentError(null);
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              commentInput.trim() &&
              !commentLoading
            ) {
              e.preventDefault();
              handleAddComment();
            }
          }}
          disabled={commentLoading}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
          onClick={handleAddComment}
          disabled={!commentInput.trim() || commentLoading}
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
        <CardTitle className="text-lg font-semibold">Comments</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {commentsContent}
        {commentsBottomContent}
      </CardContent>
    </Card>
  );
});
