"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { TabContent } from "@/components/TabContent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { commentColumns, CommentData } from "../../../../teacherTabConfigs";
import { addComment } from "../../../../[id]/teacherTabs.slice";

interface CommentsTabProps {
  location: string;
  teacherId: number;
}

export function CommentsTab({ location, teacherId }: CommentsTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.teacherTabs.commentData);
  const [commentInput, setCommentInput] = useState<string>("");
  const [commentLoading, setCommentLoading] = useState<boolean>(false);

  const handleAddComment = async () => {
    if (!commentInput.trim()) {
      return;
    }

    try {
      setCommentLoading(true);
      // TODO: Implement API call to add comment
      console.log("Adding comment:", commentInput);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const newComment: CommentData = {
        id: Date.now().toString(),
        content: commentInput,
        createdUser: "Current User", // TODO: Get from auth
        createdOn: new Date().toLocaleString(),
      };
      
      dispatch(addComment(newComment));
      setCommentInput("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const commentsCustomContent = (
    <div className="space-y-4">
      {data.length === 0 ? (
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
    />
  );
}

