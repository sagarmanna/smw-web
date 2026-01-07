'use client';

import { use } from 'react';
import { InvoiceDetailClient } from "./InvoiceDetailClient";

interface InvoiceDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { location, id } = use(params);
  
  return <InvoiceDetailClient location={location} id={id} />;
}

