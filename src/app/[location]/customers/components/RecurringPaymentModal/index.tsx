"use client";

import React, { useState, useEffect } from "react";
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
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { getCustomerRecurringPaymentInfo, RecurringPaymentInfoData } from "../../customers.api";
import { createRecurringPayment, RecurringPaymentCreateData } from "@/lib/api/legacyApiAdapter";

// Data interfaces
interface EnrolmentData {
  id: string;
  program: string;
  paymentFrequency: string;
  student: string;
  teacher: string;
  selected: boolean;
}

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
  location?: string;
  customerId?: number;
}


// Table columns for enrolments - will be created inside component to access state

export function RecurringPaymentModal({
  open,
  onOpenChange,
  onSave,
  customerName = "",
  location,
  customerId,
}: RecurringPaymentModalProps) {
  const [formData, setFormData] = useState<RecurringPaymentFormData>({
    customer: customerName,
    onThe: "1",
    every: "Monthly",
    asOf: undefined,
    via: "",
    untilMonth: "",
    untilYear: "",
    amount: "",
    enabled: true,
  });

  const [enrolments, setEnrolments] = useState<EnrolmentData[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<Array<{ id: number; name: string }>>([]);
  const [paymentFrequencies, setPaymentFrequencies] = useState<Array<{ id: number; name: string }>>([]);

  // Fetch data when modal opens
  useEffect(() => {
    const fetchRecurringPaymentInfo = async () => {
      if (!open || !location || !customerId) return;
      
      setLoading(true);
      try {
        const data = await getCustomerRecurringPaymentInfo(location, customerId);
        if (data) {
          // Map payment data to form
          const payment = data.payment;
          
          // Parse startDate (format: "Nov 03, 2025")
          let parsedDate: Date | undefined;
          try {
            parsedDate = parse(payment.startDate, "MMM dd, yyyy", new Date());
          } catch {
            parsedDate = undefined;
          }

          setFormData({
            customer: customerName || "",
            onThe: payment.entryDay.toString(),
            every: data.paymentFrequencies.find(f => f.id === payment.paymentFrequencyId)?.name || "",
            asOf: parsedDate,
            via: data.paymentMethods.find(m => m.id === payment.paymentMethodId)?.name || "",
            untilMonth: payment.expiryMonth ? payment.expiryMonth.toString().padStart(2, '0') : "",
            untilYear: payment.expiryYear ? payment.expiryYear.toString() : "",
            amount: payment.amount.toString(),
            enabled: payment.isEnabled,
          });

          // Map enrolments
          const mappedEnrolments: EnrolmentData[] = data.enrolments.map((enrolment, index) => ({
            id: `enrolment-${index}`,
            program: enrolment.programName,
            paymentFrequency: enrolment.paymentFrequency || "",
            student: enrolment.studentName,
            teacher: enrolment.teacherName,
            selected: false,
          }));
          setEnrolments(mappedEnrolments);

          // Set payment methods and frequencies
          setPaymentMethods(data.paymentMethods);
          setPaymentFrequencies(data.paymentFrequencies);
        }
      } catch (error) {
        console.error("Error fetching recurring payment info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecurringPaymentInfo();
  }, [open, location, customerId, customerName]);

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

  const handleSave = async () => {
    if (!location || !customerId) {
      console.error('Location or customerId is missing');
      return;
    }

    // Find payment method and frequency IDs from their names
    const paymentMethod = paymentMethods.find(m => m.name === formData.via);
    const paymentFrequency = paymentFrequencies.find(f => f.name === formData.every);

    if (!paymentMethod || !paymentFrequency) {
      console.error('Payment method or frequency not found');
      return;
    }

    // Format startDate (asOf) to match API format: "Nov 03, 2025"
    const formattedStartDate = formData.asOf 
      ? format(formData.asOf, "MMM dd, yyyy")
      : "";

    if (!formattedStartDate) {
      console.error('Start date is required');
      return;
    }

    setSaving(true);
    try {
      const paymentData: RecurringPaymentCreateData = {
        customerId: customerId,
        startDate: formattedStartDate,
        paymentDay: parseInt(formData.onThe, 10),
        paymentFrequencyId: paymentFrequency.id,
        paymentMethodId: paymentMethod.id,
        expiryMonth: formData.untilMonth || undefined,
        expiryYear: formData.untilYear || undefined,
        amount: parseFloat(formData.amount) || 0,
        isRecurringPaymentEnabled: formData.enabled,
      };

      const response = await createRecurringPayment(location, customerId, paymentData);

      if (response.status) {
        // Success - call the onSave callback if provided
        const selectedEnrolmentIds = enrolments
          .filter(enrolment => enrolment.selected)
          .map(enrolment => enrolment.id);
        
        onSave?.({
          ...formData,
          selectedEnrolments: selectedEnrolmentIds,
        });
        
        onOpenChange(false);
      } else {
        // Handle error from API
        console.error('Failed to create recurring payment:', response.message || 'Unknown error');
        alert(response.message || 'Failed to create recurring payment');
      }
    } catch (error) {
      console.error('Error creating recurring payment:', error);
      alert(error instanceof Error ? error.message : 'Failed to create recurring payment');
    } finally {
      setSaving(false);
    }
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

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <>
          {/* Form Fields */}
          <div className="space-y-4">
            {/* Row 1: Customer, On The, Every */}
            <div className="grid grid-cols-3 gap-4">
              {/* Customer */}
              <div className="space-y-2">
                <Label htmlFor="customer" className="font-semibold">Customer</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  readOnly
                  disabled
                  className="bg-muted"
                />
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
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading..." : "Select frequency"} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentFrequencies.map((frequency) => (
                      <SelectItem key={frequency.id} value={frequency.name}>
                        {frequency.name}
                      </SelectItem>
                    ))}
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
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading..." : "Select payment method"} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.name}>
                        {method.name}
                      </SelectItem>
                    ))}
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
            {enrolments.length > 0 ? (
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
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No enrolment Available!
              </div>
            )}
          </div>
          </>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2 p-4 pt-3 border-t bg-background">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
