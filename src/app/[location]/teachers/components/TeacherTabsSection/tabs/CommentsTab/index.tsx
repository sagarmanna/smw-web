"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";
import { TabContent } from "@/components/TabContent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { commentColumns, CommentData } from "../../../../teacherTabConfigs";
import { setComments, fetchCommentsData } from "../../../../[id]/teacherTabs.slice";
import { createComment } from "@/lib/api/comment.api";

interface CommentsTabProps {
  location: string;
  teacherId: number;
}

export function CommentsTab({ location, teacherId }: CommentsTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.teacherTabs.commentData);
  const loading = useAppSelector((state) => state.teacherTabs.commentsLoading);
  const error = useAppSelector((state) => state.teacherTabs.commentsError);
  const commentsTeacherId = useAppSelector((state) => state.teacherTabs.commentsTeacherId);
  const [commentInput, setCommentInput] = useState<string>("");
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we don't have data for this teacher yet
    if (commentsTeacherId !== teacherId) {
      dispatch(fetchCommentsData({ location, teacherId }));
    }
  }, [location, teacherId, dispatch, commentsTeacherId]);

  const handleAddComment = async () => {
    if (!commentInput.trim()) {
      setCommentError("Content cannot be blank.");
      return;
    }

    try {
      setCommentLoading(true);
      
      // Call the new API to create a comment
      const response = await createComment(
        location,
        teacherId,  
        2, // instanceType = 2 for teachers
        { content: commentInput.trim() }
      );

      if (response.success && response.data?.status) {
        toast.success(response.message || "Comment added successfully");
        // Use the comments data from the POST response instead of making another GET call
        const comments = response.data.data?.body || [];
        // Transform comments to match CommentData type (id should be string)
        const transformedComments: CommentData[] = comments.map((comment) => ({
          ...comment,
          id: String(comment.id),
        }));
        // Update Redux state with all comments from the response
        dispatch(setComments(transformedComments));
        setCommentInput("");
        setCommentError(null);
      } else {
        const errorMessage = response.message || "Failed to add comment";
        toast.error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message ||
        (error as { errorCode?: string; message?: string })?.message ||
        "Failed to add comment";
      console.error("Failed to add comment:", error);
      toast.error(errorMessage);
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
          <div key={comment.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{comment.createdUser}</p>
                <p className="text-xs text-muted-foreground">{comment.createdOn}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
            </div>
          </div>
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
    <TabContent
      title="Comments"
      data={data}
      columns={commentColumns}
      hasTable={false}
      emptyState="No results found."
      customContent={commentsCustomContent}
      bottomContent={commentsBottomContent}
      loading={loading}
      error={error}
    />
  );
}
