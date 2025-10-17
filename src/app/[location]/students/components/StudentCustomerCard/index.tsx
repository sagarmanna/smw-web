// StudentCustomerCard.tsx - Reusable Customer Card Component
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoField } from "@/components/TablesInfoField";

interface StudentCustomerCardProps {
  customer: string;
  phone: string;
}

export function StudentCustomerCard({
  customer,
  phone,
}: StudentCustomerCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <InfoField label="Customer" value={customer} />
          <InfoField label="Phone" value={phone} />
        </div>
      </CardContent>
    </Card>
  );
}