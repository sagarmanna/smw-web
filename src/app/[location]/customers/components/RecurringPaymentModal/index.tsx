"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomTable } from "@/components/CustomTable";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { mockCustomerTabData, RecurringPaymentEnrolmentData } from "../../mockData/customersMockData";

// Data interfaces
type EnrolmentData = RecurringPaymentEnrolmentData;

interface RecurringPaymentFormData {
  customer: string;
  onThe: string;
  every: string;
  asOf: Date | undefined;
  via: string;
  untilMonth: string;
  untilYear: string;
  amount: string;
  enabled: boolean;
}

interface RecurringPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: RecurringPaymentFormData & { selectedEnrolments: string[] }) => void;
  customerName?: string;
}


// Table columns for enrolments - will be created inside component to access state

export function RecurringPaymentModal({
  open,
  onOpenChange,
  onSave,
  customerName = "123 123",
}: RecurringPaymentModalProps) {
  const [formData, setFormData] = useState<RecurringPaymentFormData>({
    customer: customerName,
    onThe: "1",
    every: "Monthly",
    asOf: new Date(2025, 9, 15), // Oct 15, 2025
    via: "Visa",
    untilMonth: "",
    untilYear: "",
    amount: "115",
    enabled: true,
  });

  const [enrolments, setEnrolments] = useState<EnrolmentData[]>(mockCustomerTabData.recurringPaymentEnrolments);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Table columns for enrolments - created inside component to access state
  const enrolmentColumns: ColumnDef<EnrolmentData>[] = [
    {
      id: "select",
      header: () => {
        const allSelected = enrolments.every(enrolment => enrolment.selected);
        const someSelected = enrolments.some(enrolment => enrolment.selected);
        
        return (
          <Checkbox
            checked={allSelected}
            onCheckedChange={(value) => {
              const newSelected = enrolments.map(enrolment => ({
                ...enrolment,
                selected: value as boolean,
              }));
              setEnrolments(newSelected);
            }}
            aria-label="Select all"
            className={someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary" : ""}
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.selected}
          onCheckedChange={(checked) => {
            handleEnrolmentSelect(row.original.id, checked as boolean);
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "program",
      header: "Program",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("program")}</div>
      ),
    },
    {
      accessorKey: "paymentFrequency",
      header: "Payment Frequency",
    },
    {
      accessorKey: "student",
      header: "Student",
    },
    {
      accessorKey: "teacher",
      header: "Teacher",
    },
  ];

  const handleInputChange = (field: keyof RecurringPaymentFormData, value: string | boolean | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEnrolmentSelect = (enrolmentId: string, selected: boolean) => {
    setEnrolments(prev =>
      prev.map(enrolment =>
        enrolment.id === enrolmentId
          ? { ...enrolment, selected }
          : enrolment
      )
    );
  };

  const handleSave = () => {
    const selectedEnrolmentIds = enrolments
      .filter(enrolment => enrolment.selected)
      .map(enrolment => enrolment.id);
    
    onSave?.({
      ...formData,
      selectedEnrolments: selectedEnrolmentIds,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Recurring Payment</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-6">
          {/* Information Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              SMW will automatically record a payment for this customer at the frequency set below. 
              It will enter the payment on the Entry Day and post-date it for the Payment Day. 
              It will do this for the Amount indicated via the Payment Method indicated until the Expiry Date is reached. 
              This recurring payment will begin as of the next occurrence of the Entry Day.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Row 1: Customer, On The, Every */}
            <div className="grid grid-cols-3 gap-4">
              {/* Customer */}
              <div className="space-y-2">
                <Label htmlFor="customer" className="font-semibold">Customer</Label>
                <Select
                  value={formData.customer}
                  onValueChange={(value) => handleInputChange("customer", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="123 123">123 123</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* On The */}
              <div className="space-y-2">
                <Label htmlFor="onThe" className="font-semibold">On The</Label>
                <Select
                  value={formData.onThe}
                  onValueChange={(value) => handleInputChange("onThe", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Every */}
              <div className="space-y-2">
                <Label htmlFor="every" className="font-semibold">Every</Label>
                <Select
                  value={formData.every}
                  onValueChange={(value) => handleInputChange("every", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Bi-Monthly">Bi-Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Every 4 Months">Every 4 Months</SelectItem>
                  <SelectItem value="Every 5 Months">Every 5 Months</SelectItem>
                  <SelectItem value="Semi-Annually">Semi-Annually</SelectItem>
                  <SelectItem value="Every 7 Months">Every 7 Months</SelectItem>
                  <SelectItem value="Every 8 Months">Every 8 Months</SelectItem>
                  <SelectItem value="Every 9 Months">Every 9 Months</SelectItem>
                  <SelectItem value="Every 10 Months">Every 10 Months</SelectItem>
                  <SelectItem value="Every 11 Months">Every 11 Months</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: As Of (full width) */}
            <div className="space-y-2">
              <Label htmlFor="asOf" className="font-semibold">As Of</Label>
              <div className="w-1/3">
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.asOf && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.asOf ? format(formData.asOf, "MMM dd, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.asOf}
                      onSelect={(date) => {
                        handleInputChange("asOf", date || new Date());
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Row 3: Via, Until, Amount */}
            <div className="grid grid-cols-3 gap-4">
              {/* Via */}
              <div className="space-y-2">
                <Label htmlFor="via" className="font-semibold">Via</Label>
                <Select
                  value={formData.via}
                  onValueChange={(value) => handleInputChange("via", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Debit">Debit</SelectItem>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                    <SelectItem value="Amex">Amex</SelectItem>
                    <SelectItem value="Gift Card">Gift Card</SelectItem>
                    <SelectItem value="E-Transfer">E-Transfer</SelectItem>
                    <SelectItem value="Guitar Core">Guitar Core</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Until - Two dropdowns side by side */}
              <div className="space-y-2">
                <Label htmlFor="until" className="font-semibold">Untill</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.untilMonth}
                    onValueChange={(value) => handleInputChange("untilMonth", value)}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                          {(i + 1).toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.untilYear}
                    onValueChange={(value) => handleInputChange("untilYear", value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="YEAR" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="font-semibold">In The Amount Of</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="0.00"
                  className="text-right"
                />
              </div>
            </div>

            {/* Enabled Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => handleInputChange("enabled", checked as boolean)}
              />
              <Label htmlFor="enabled" className="font-semibold">Enabled</Label>
            </div>
          </div>

          {/* Enrolments Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">To Be Applied Towards The Following Enrolments</h3>
            <CustomTable
              data={enrolments}
              columns={enrolmentColumns}
              size="compact"
              enableSorting={false}
              enableSearch={false}
              enableExport={false}
              enableFilter={false}
              enablePrint={false}
              enableRowsPerPage={false}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 p-4 pt-3 border-t bg-background">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
