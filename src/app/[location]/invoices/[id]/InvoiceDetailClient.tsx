"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { InvoiceDetailsCard } from "../components/InvoiceDetailsCard";
import { InvoiceCustomerCard } from "../components/InvoiceCustomerCard";
import { InvoiceItemsCard } from "../components/InvoiceItemsCard";
import { InvoicePaymentsCard } from "../components/InvoicePaymentsCard";
import { InvoiceTotalsCard } from "../components/InvoiceTotalsCard";
import { InvoiceMessageCard } from "../components/InvoiceMessageCard";
import { InvoiceCommentsCard } from "../components/InvoiceCommentsCard";
import { InvoiceHistoryCard } from "../components/InvoiceHistoryCard";
import { ReturnInvoiceModal } from "../components/modals/ReturnInvoiceModal";
import { VoidInvoiceModal } from "../components/modals/VoidInvoiceModal";
import { InvoiceEmailModal, type InvoiceEmailData } from "../components/modals/InvoiceEmailModal";
import { InvoiceDiscountWarningBanner } from "../components/InvoiceDiscountWarningBanner";
import { InvoiceReceivePaymentAction } from "../components/actions/InvoiceReceivePaymentAction";
import { useInvoiceDetails } from "../hooks/useInvoiceDetails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatCurrency";
import { Mail, Printer, Settings, ArrowLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface InvoiceDetailClientProps {
  location: string;
  id: string;
}

export function InvoiceDetailClient({ location, id }: InvoiceDetailClientProps) {
  const router = useRouter();
  const invoiceId = Number(id);
  
  const [showReturnModal, setShowReturnModal] = React.useState(false);
  const [showVoidModal, setShowVoidModal] = React.useState(false);
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [receivePaymentOpenRequest, setReceivePaymentOpenRequest] = React.useState(0);

  // Use main invoice details hook
  const {
    loading: isLoading,
    error,
    invoiceDetail,
    historyData,
    historyPagination,
    historyLoading,
    fetchHistory,
    commentsData,
    commentsPagination,
    commentsLoading,
    fetchComments,
    refresh,
    handleSaveDetails,
    handleCustomerChange,
    handleSaveDiscount,
    handleSaveItem,
    handleDeleteItem,
    handleAdjustTax,
    handleSaveMessage,
    handleAddComment,
    handleReturnConfirm,
    isReturning,
    handleVoidConfirm,
    isVoiding,
    showDiscountWarning,
    setShowDiscountWarning,
  } = useInvoiceDetails(location, invoiceId);

  const customerId = React.useMemo(() => {
    const idFromInvoice = invoiceDetail?.customer?.customerId;
    return typeof idFromInvoice === "number" && idFromInvoice > 0 ? idFromInvoice : null;
  }, [invoiceDetail?.customer?.customerId]);

  const pageTitle = React.useMemo(() => {
    if (!invoiceDetail) return `Invoice #${id}`;
    return invoiceDetail.number;
  }, [invoiceDetail, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Invoices",
        onClick: () => router.push(`/${location}/invoices`),
      },
    ],
    [location, router]
  );

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [],
    []
  );

  const handleReturnClick = React.useCallback(() => {
    setShowReturnModal(true);
  }, []);

  const handleEmailInvoice = React.useCallback(() => {
    setShowEmailModal(true);
  }, []);

  const handleSendInvoiceEmail = React.useCallback(
    async (emailData: InvoiceEmailData) => {
      console.log("Sending invoice email:", emailData);
      // TODO: Implement actual email API call
      toast.success("Email sent successfully");
    },
    []
  );

  // Wrap return confirm to close modal
  const handleReturnConfirmWithClose = React.useCallback(() => {
    handleReturnConfirm();
    setShowReturnModal(false);
  }, [handleReturnConfirm]);

  // Wrap void confirm to close modal
  const handleVoidConfirmWithClose = React.useCallback(() => {
    handleVoidConfirm();
    setShowVoidModal(false);
  }, [handleVoidConfirm]);

  const isReturnedByStatus = invoiceDetail?.status === "Returned";
  const isCreditInvoice = Boolean(
    invoiceDetail &&
      (invoiceDetail.totals.total < 0 ||
        invoiceDetail.totals.balance < 0 ||
        invoiceDetail.items.some((item) => item.qty < 0 || item.price < 0))
  );
  const isReturned = isReturnedByStatus || isCreditInvoice;
  const isVoided = invoiceDetail?.status === "Voided";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading invoice..." className="text-center" />
      </div>
    );
  }

  if (!invoiceDetail && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Invoice not found"}
          title="Unable to Load Invoice Details"
          fallbackMessage="An unexpected error occurred while loading the invoice details. Please try again later."
        />
      </div>
    );
  }

  if (!invoiceDetail) {
    return null;
  }

  return (
    <>
      <div className="bg-white dark:bg-black -mt-2">
        {error && (
          <div className="mb-4">
            <ErrorDisplay
              error={error}
              title="Unable to Load Invoice Details"
              fallbackMessage="An unexpected error occurred while loading the invoice details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Invoice actions"
          showProfileIcon={false}
          rightContent={
            invoiceDetail && (
              <div className="flex items-center gap-2">
                {isReturned ? (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                    Returned
                  </Badge>
                ) : !isVoided ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-600"
                          onClick={handleReturnClick}
                          aria-label="Return invoice"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Return Invoice</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                        onClick={handleEmailInvoice}
                        aria-label="Email invoice"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Email Invoice</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          // TODO: Implement print functionality
                          window.print();
                        }}
                        aria-label="Print invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Print Invoice</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {invoiceDetail.status === "Paid" || isReturned ? (
                  <span className="text-sm font-semibold ml-2">
                    {invoiceDetail.status} {formatCurrency(invoiceDetail.totals.total)}
                  </span>
                ) : isVoided ? (
                  <span className="text-sm font-semibold ml-2">
                    VOIDED {formatCurrency(invoiceDetail.totals.total)}
                  </span>
                ) : (
                  <span className="text-sm font-semibold ml-2">
                    OWING {formatCurrency(invoiceDetail.totals.balance)}
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setReceivePaymentOpenRequest((prev) => prev + 1)}
                      disabled={!customerId}
                    >
                      Receive Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (!isVoided) {
                          setShowVoidModal(true);
                        }
                      }}
                      disabled={isVoided}
                    >
                      Void
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          }
        />

        {/* Main Content */}
        <div className="space-y-3 sm:space-y-4 mt-4">
          {/* Discount Warning Banner */}
          <InvoiceDiscountWarningBanner
            show={showDiscountWarning}
            onDismiss={() => setShowDiscountWarning(false)}
          />

          {/* Top Row - Details and Customer Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <InvoiceDetailsCard
              invoice={invoiceDetail}
              isLoading={isLoading}
              onSaveDetails={handleSaveDetails}
            />

            <InvoiceCustomerCard
              customer={invoiceDetail.customer}
              location={location}
              invoiceId={invoiceId}
              isLoading={isLoading}
              onCustomerChange={handleCustomerChange}
            />
          </div>

          {/* Items Section - Full Width */}
          <InvoiceItemsCard
            location={location}
            items={invoiceDetail.items}
            isLoading={isLoading}
            isVoided={isVoided}
            isReturned={isReturned}
            onSaveDiscount={handleSaveDiscount}
            onSaveItem={handleSaveItem}
            onDeleteItem={handleDeleteItem}
          />

          {/* Payments and Totals Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <InvoicePaymentsCard
              location={location}
              customerId={customerId ?? undefined}
              customerName={invoiceDetail.customer.name || ""}
              customerEmail={invoiceDetail.customer.email || ""}
              customerPhone={invoiceDetail.customer.phone || ""}
              payments={invoiceDetail.payments}
              isLoading={isLoading}
              onPaymentUpdated={refresh}
            />

            <InvoiceTotalsCard
              totals={invoiceDetail.totals}
              items={invoiceDetail.items}
              isLoading={isLoading}
              isVoided={isVoided}
              onAdjustTax={handleAdjustTax}
            />
          </div>

          {/* Bottom Row - Message, Comments, History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <InvoiceMessageCard
              message={invoiceDetail.message}
              isLoading={isLoading}
              onSaveMessage={handleSaveMessage}
            />

            <InvoiceCommentsCard
              comments={commentsData}
              isLoading={isLoading}
              pagination={commentsPagination}
              commentsLoading={commentsLoading}
              onPageChange={fetchComments}
              onAddComment={handleAddComment}
            />

            <InvoiceHistoryCard
              history={historyData}
              isLoading={isLoading}
              pagination={historyPagination}
              historyLoading={historyLoading}
              onPageChange={fetchHistory}
              location={location}
            />
          </div>
        </div>
      </div>

      {/* Return Invoice Modal */}
      <ReturnInvoiceModal
        open={showReturnModal}
        onOpenChange={setShowReturnModal}
        onConfirm={handleReturnConfirmWithClose}
        isReturning={isReturning}
      />

      {/* Void Invoice Modal */}
      <VoidInvoiceModal
        open={showVoidModal}
        onOpenChange={setShowVoidModal}
        onConfirm={handleVoidConfirmWithClose}
        isVoiding={isVoiding}
      />

      {/* Email Invoice Modal */}
      {invoiceDetail && (
        <InvoiceEmailModal
          open={showEmailModal}
          onOpenChange={setShowEmailModal}
          onSend={handleSendInvoiceEmail}
          location={location}
          invoiceId={invoiceId}
        />
      )}

      <InvoiceReceivePaymentAction
        location={location}
        customerId={customerId}
        customerName={invoiceDetail.customer.name || ""}
        customerEmail={invoiceDetail.customer.email || ""}
        customerPhone={invoiceDetail.customer.phone || ""}
        onPaymentSaved={refresh}
        openRequestKey={receivePaymentOpenRequest}
      />
    </>
  );
}

