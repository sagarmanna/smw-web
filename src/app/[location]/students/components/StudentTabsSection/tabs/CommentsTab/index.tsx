"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { CommentData } from "../../../../[id]/studentTabConfigs";
import { fetchCommentsData } from "../../../../[id]/studentTabs.slice";
import { LoadingAnimation } from "@/components/LoadingAnimation";

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
      
      // TODO: Implement add comment functionality
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Add comment:', commentInput);
      setCommentInput("");
      setCommentError(null);
      // Refresh comments list
      dispatch(fetchCommentsData({ location, studentId, page: 1 }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add comment";
      console.error("Failed to add comment:", error);
      setCommentError(errorMessage);
    } finally {
      setCommentLoading(false);
    }
  };

  const commentsCustomContent = (
    <div className="space-y-4">
      {loading ? (
        <LoadingAnimation 
          size="md" 
          text="Loading comments..." 
          className="py-8"
        />
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
          className={`flex-grow ${commentError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          value={commentInput}
          onChange={(e) => {
            setCommentInput(e.target.value);
            if (commentError) setCommentError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white"
          onClick={handleAddComment}
          disabled={commentLoading}
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
