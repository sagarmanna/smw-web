"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, User, ChevronLeft, ChevronRight } from "lucide-react";
import { CommentData } from "../../../../[id]/studentTabConfigs";
import { fetchCommentsData } from "../../../../[id]/studentTabs.slice";
import { Skeleton } from "@/components/ui/skeleton";
import { createComment } from "@/lib/api/comment.api";

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
      return; // Don't submit empty comments
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
        // Clear input and refresh comments list
        setCommentInput("");
        setCommentError(null);
        // Refresh comments list (fetch current page)
        dispatch(fetchCommentsData({ location, studentId, page: currentPage }));
      } else {
        // API returned an error
        const errorMessage = response.message || "Failed to create comment";
        console.error("Error creating comment:", errorMessage);
        setCommentError(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string })?.message ||
        (error as { errorCode?: string; message?: string })?.message ||
        "Failed to create comment";
      console.error("Error creating comment:", error);
      setCommentError(errorMessage);
    } finally {
      setCommentLoading(false);
    }
  };

  const commentsCustomContent = (
    <div className="space-y-4">
      {loading ? (
        // Loading skeleton
        Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3 flex-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        ))
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments found.
        </div>
      ) : (
        (data as CommentData[]).map((comment, idx: number) => (
          <div
            key={comment.id ?? idx}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <div className="font-semibold text-blue-600">
                  {comment.createdUser}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {comment.content}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap">
              {comment.createdOn}
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
