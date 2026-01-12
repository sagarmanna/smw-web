"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TermsOfServiceContent } from "./components/TermsOfServiceContent";

interface TermsOfServiceClientProps {
  location: string;
}

export function TermsOfServiceClient({}: TermsOfServiceClientProps) {
  return (
    <div className="bg-white dark:bg-black -mt-2">
      <div className="py-3 sm:py-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Terms Of Service
        </h1>
      </div>
      
      <div className="mt-4 space-y-3 sm:space-y-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Terms Of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <TermsOfServiceContent />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
