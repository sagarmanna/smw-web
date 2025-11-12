import { SummaryCard } from "@/components/SummaryCard";
import { BookOpen, DollarSign, FileText, Star } from "lucide-react";

export interface SummaryCardsProps {
  summaryData: {
    lessonsDue: string;
    outstandingInvoice: string;
    totalCredits: string;
    balance: string;
  };
  loading: boolean;
}

export function SummaryCards({ summaryData, loading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pb-4">
      <SummaryCard
        title="Lessons Due"
        value={summaryData.lessonsDue}
        icon={<BookOpen className="h-6 w-6 text-white" />}
        iconBackgroundColor="bg-cyan-500"
        loading={loading}
      />
      <SummaryCard
        title="Outstanding Invoice"
        value={summaryData.outstandingInvoice}
        icon={<FileText className="h-6 w-6 text-white" />}
        iconBackgroundColor="bg-orange-500"
        loading={loading}
      />
      <SummaryCard
        title="Credits"
        value={summaryData.totalCredits}
        icon={<Star className="h-6 w-6 text-white" />}
        iconBackgroundColor="bg-green-500"
        loading={loading}
      />
      <SummaryCard
        title="Balance"
        value={summaryData.balance}
        icon={<DollarSign className="h-6 w-6 text-white" />}
        iconBackgroundColor="bg-orange-400"
        loading={loading}
      />
    </div>
  );
}

