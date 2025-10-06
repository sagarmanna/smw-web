"use client";

import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccessDeniedCard() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-destructive/10 p-4 rounded-full">
            <Ban className="text-destructive w-12 h-12" />
          </div>
          <CardTitle className="text-3xl font-bold mt-4">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
          <Button
            onClick={() => router.back()}
            className="mt-6 w-full"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
