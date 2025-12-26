import React from 'react';
import { ItemsListingClient } from './ItemsListingClient';

interface ItemsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { location } = await params;
  return <ItemsListingClient location={location} />;
}

