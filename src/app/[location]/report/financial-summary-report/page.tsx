import { FinancialSummaryClient } from './financialSummaryClient'

interface FinancialSummaryPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function FinancialSummaryPage({ params }: FinancialSummaryPageProps) {
  const { location } = await params;
  return <FinancialSummaryClient location={location} />;
}