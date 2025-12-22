"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { CommentData } from "../../../../[id]/studentTabConfigs";
import { setComments } from "../../../../[id]/studentTabs.slice";
import { createComment } from "@/lib/api/comment.api";
import { toast } from "sonner";

// Comment item component with avatar error handling
const CommentItem = ({ comment }: { comment: CommentData }) => {
  const [imageError, setImageError] = useState(false);

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
};

interface CommentsTabProps {
  location: string;
  studentId: string;
}

export function CommentsTab({ location, studentId }: CommentsTabProps) {
  const dispatch = useAppDispatch();
  
  // Read data from Redux state (no API call here - handled by parent)
  const data = useAppSelector((state) => state.studentTabs.commentData);
  const loading = useAppSelector((state) => state.studentTabs.commentsLoading);
  const error = useAppSelector((state) => state.studentTabs.commentsError);
  
  const [commentInput, setCommentInput] = useState<string>("");
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const handleAddComment = async () => {
    if (!commentInput.trim()) {
      setCommentError("Content cannot be blank.");
      return;
    }

    try {
      setCommentLoading(true);
      setCommentError(null);
      
      const response = await createComment(
        location,
        Number(studentId),
        1, // instanceType = 1 for student
        { content: commentInput.trim() }
      );

      if (response.success && response.data?.status) {
        toast.success(response.message || "Comment added successfully");
        // Use the comments data from the POST response instead of making another GET call
        const comments = response.data.data?.body || [];
        // Comments from API already match CommentData type (id is number)
        const transformedComments: CommentData[] = comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdUser: comment.createdUser,
          avatar: comment.avatar,
          createdOn: comment.createdOn,
        }));
        dispatch(setComments(transformedComments));
        setCommentInput("");
        setCommentError(null);
      } else {
        const errorMessage = response.message || "Failed to add comment";
        toast.error(errorMessage);
        setCommentError(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message ||
        (error as { errorCode?: string; message?: string })?.message ||
        "Failed to create comment";
      console.error("Error creating comment:", error);
      toast.error(errorMessage);
      setCommentError(errorMessage);
    } finally {
      setCommentLoading(false);
    }
  };

  const commentsCustomContent = (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No results found.
        </div>
      ) : (
        (data as CommentData[]).map((comment) => (
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
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              commentInput.trim() &&
              !commentLoading
            ) {
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
        {commentsCustomContent}
        {commentsBottomContent}
      </CardContent>
    </Card>
  );
}
