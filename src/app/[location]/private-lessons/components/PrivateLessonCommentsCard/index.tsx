"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface PrivateLessonCommentsCardProps {
  isLoading?: boolean;
}

export const PrivateLessonCommentsCard = React.memo(function PrivateLessonCommentsCard({
  isLoading = false,
}: PrivateLessonCommentsCardProps) {
  const [message, setMessage] = React.useState("");

  const handleSendMessage = React.useCallback(() => {
    toast.info("This feature is under process");
    setMessage("");
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div role="status" aria-label="Loading comments">
            <LoadingAnimation 
              size="md" 
              text="Loading comments..." 
              className="py-8"
            />
          </div>
        ) : (
          <>
            <div className="mb-4 min-h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-2" aria-hidden="true">💬</div>
                <span className="text-sm font-medium">No results found.</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-green-600 hover:bg-green-700"
                disabled={!message.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

