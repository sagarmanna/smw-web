"use client";

import { useState, useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, User, ChevronLeft, ChevronRight } from "lucide-react";
import { CommentData } from "../../../../[id]/studentTabConfigs";
import { fetchCommentsData } from "../../../../[id]/studentTabs.slice";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface CommentsTabProps {
  location: string;
  studentId: string;
}

export function CommentsTab({ location, studentId }: CommentsTabProps) {
  const dispatch = useAppDispatch();
  
  // Read data from Redux state (no API call here - handled by parent)
  const data = useAppSelector((state) => state.studentTabs.commentData);
  const pagination = useAppSelector((state) => state.studentTabs.commentPagination);
  const loading = useAppSelector((state) => state.studentTabs.commentsLoading);
  const error = useAppSelector((state) => state.studentTabs.commentsError);
  
  const [commentInput, setCommentInput] = useState<string>("");
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  
  // Use page from API response for display (synced with actual data)
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || 0;
  const rowsPerPage = pagination?.limit || 10; // Use limit from API response

  const handlePreviousPage = () => {
    if (currentPage > 1 && !loading) {
      const newPage = currentPage - 1;
      // Fetch data for the new page (only page parameter, no limit)
      dispatch(fetchCommentsData({ location, studentId, page: newPage }));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !loading) {
      const newPage = currentPage + 1;
      // Fetch data for the new page (only page parameter, no limit)
      dispatch(fetchCommentsData({ location, studentId, page: newPage }));
    }
  };

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
      // Refresh comments list (fetch current page)
      dispatch(fetchCommentsData({ location, studentId, page: currentPage }));
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
          <div key={comment.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
            <div className="flex-shrink-0">
              {comment.avatar ? (
                <img 
                  src={comment.avatar} 
                  alt={comment.createdUser}
                  className="h-8 w-8 rounded-full"
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
        ))
      )}
    </div>
  );

  const commentsBottomContent = (
    <>
      {/* Pagination Controls */}
      {totalRows > 0 && (
        <div className="flex items-center justify-between mt-4 mb-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} comments
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
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
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
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
