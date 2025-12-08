"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";
import { TabContent } from "@/components/TabContent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { commentColumns, CommentData } from "../../../../teacherTabConfigs";
import { addComment, fetchCommentsData } from "../../../../[id]/teacherTabs.slice";
import { createNote } from "@/lib/api/legacyApiAdapter";

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

  useEffect(() => {
    // Only fetch if we don't have data for this teacher yet
    if (commentsTeacherId !== teacherId) {
      dispatch(fetchCommentsData({ location, teacherId }));
    }
  }, [location, teacherId, dispatch, commentsTeacherId]);

  const handleAddComment = async () => {
    if (!commentInput.trim()) {
      return;
    }

    try {
      setCommentLoading(true);
      
      // Call the legacy API to create a note/comment
      const response = await createNote(
        location,
        teacherId,
        2, // instanceType = 2 for teachers
        commentInput.trim()
      );

      if (response.status) {
        toast.success(response.message || "Comment added successfully");
        // Refresh comments list to show the new comment
        dispatch(fetchCommentsData({ location, teacherId }));
        setCommentInput("");
      } else {
        const errorMessage = response.message || response.errors?.join(", ") || "Failed to add comment";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add comment";
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
    <div className="mt-4 flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Type message"
        className="flex-grow"
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
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
