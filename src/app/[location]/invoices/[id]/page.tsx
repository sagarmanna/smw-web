'use client';

import { use, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchInvoice, clearInvoice } from './invoices-details.slice';
import { InvoiceDetailClient } from "./InvoiceDetailClient";

interface InvoiceDetailPageProps {
  params: Promise<{
    location: string;
    id: string;
  }>;
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { location, id } = use(params);
  const dispatch = useAppDispatch();
  const invoiceId = Number(id);
  
  // Track previous invoiceId/location to detect changes and prevent duplicate fetches
  const prevKeyRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Only fetch if we have valid IDs
    if (!invoiceId || !location || isNaN(invoiceId)) return;
    
    // Create a unique key for this invoice/location combination
    const currentKey = `${location}-${invoiceId}`;
    
    // Skip if we've already fetched for this exact combination (prevents duplicate calls during re-renders)
    if (prevKeyRef.current === currentKey) {
      return;
    }
    
    // If invoiceId changed, clear previous invoice data immediately
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== currentKey) {
      const prevInvoiceId = prevKey.split('-')[1];
      if (prevInvoiceId && prevInvoiceId !== invoiceId.toString()) {
        dispatch(clearInvoice());
      }
    }
    
    // Update the ref to track this fetch
    prevKeyRef.current = currentKey;
    
    // Fetch invoice details on initial page load
    dispatch(fetchInvoice({ location, invoiceId }));
  }, [location, invoiceId, dispatch]);

  // Render the client component that displays the details
  return <InvoiceDetailClient location={location} id={id} />;
}

