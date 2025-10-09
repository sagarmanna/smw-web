"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CustomersClient } from "./CustomersClient";
import { CustomerDetailClient } from "./CustomerDetailClient";

export default function CustomersPageClient({ location }: { location: string }) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";

  if (id) {
    return <CustomerDetailClient location={location} id={id} />;
  }
  return <CustomersClient location={location} />;
}


