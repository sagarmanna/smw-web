"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getEquipmentRentalsInfo,
  getEquipmentRentalsInfoForUpdate,
  type InstrumentRental,
  type Student,
} from "./Equipment-Rentals.api";
import { createEquipmentRental, equipmentReturned } from "@/lib/api/legacyApiAdapter";

interface InstrumentData {
  id: string;
  instrumentId: number;
  instrumentCode: string;
  instrument: string;
  retailValue: string;
  assetTag: string;
  monthlyRate: string;
  numberOfMonths: string;
  total: string;
}

interface EquipmentRentalFormData {
  customer: string;
  address: string;
  city: string;
  postalCode: string;
  homePhone: string;
  workPhone: string;
  otherPhone: string;
  email: string;
  studentId: string;
  rentalStartDate: Date | undefined;
  onGoing: boolean;
  duration: string;
  returnDate: Date | undefined;
  securityDeposit: "yes" | "no";
  tenderType: string;
  depositAmount: string;
}

interface EquipmentRentalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (
    data: EquipmentRentalFormData & { instruments: InstrumentData[] }
  ) => void;
  customerId: number;
  location: string;
  rentalId?: number;
  onReprintAgreement?: (rentalId: number) => void;
  onEquipmentReturned?: (rentalId: number) => void;
}

const InstrumentFormRow = React.memo(
  ({
    newInstrument,
    onNewInstrumentChange,
    onInputFocus,
    onInputBlur,
    availableInstruments,
  }: {
    newInstrument: InstrumentData;
    onNewInstrumentChange: (field: keyof InstrumentData, value: string) => void;
    onInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
    onInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    availableInstruments: InstrumentRental[];
  }) => {
    return (
      <tr className="border-b dark:border-gray-700">
        <td className="p-2">
          <Select
            value={
              newInstrument.instrumentId > 0
                ? newInstrument.instrumentId.toString()
                : ""
            }
            onValueChange={(value) => {
              const instrument = availableInstruments.find(
                (i) => i.id.toString() === value
              );
              if (instrument) {
                onNewInstrumentChange("instrumentId", value);
                onNewInstrumentChange("instrumentCode", instrument.code);
                onNewInstrumentChange("instrument", instrument.description);
                onNewInstrumentChange(
                  "monthlyRate",
                  instrument.price.toString()
                );
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="--Select an option" />
            </SelectTrigger>
            <SelectContent>
              {availableInstruments.map((instrument) => (
                <SelectItem
                  key={instrument.id}
                  value={instrument.id.toString()}
                >
                  {instrument.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
        <td className="p-2">
          <Input
            value={newInstrument.retailValue}
            onChange={(e) =>
              onNewInstrumentChange("retailValue", e.target.value)
            }
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            placeholder="0.00"
            className="w-full"
          />
        </td>
        <td className="p-2">
          <Input
            value={newInstrument.assetTag}
            onChange={(e) => onNewInstrumentChange("assetTag", e.target.value)}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            className="w-full"
          />
        </td>
        <td className="p-2">
          <Input
            value={newInstrument.monthlyRate}
            onChange={(e) =>
              onNewInstrumentChange("monthlyRate", e.target.value)
            }
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            placeholder="0"
            className="w-full"
          />
        </td>
        <td className="p-2">
          <Input
            value={newInstrument.numberOfMonths}
            onChange={(e) =>
              onNewInstrumentChange("numberOfMonths", e.target.value)
            }
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            className="w-full"
          />
        </td>
        <td className="p-2">
          <Input
            value={newInstrument.total}
            readOnly
            placeholder="0.00"
            className="w-full bg-gray-50 dark:bg-gray-800"
          />
        </td>
      </tr>
    );
  }
);

InstrumentFormRow.displayName = "InstrumentFormRow";

// Helper function to calculate return date based on the new logic
const calculateReturnDate = (startDate: Date, months: number): Date => {
  const dayOfMonth = startDate.getDate();
  const returnDate = new Date(startDate.getTime());
  
  // If start date is between 1-7, count the current month as the first month
  // Otherwise, start counting from the next month
  if (dayOfMonth >= 1 && dayOfMonth <= 7) {
    // Start date is 1-7: add (months - 1) to get the return month
    // Then set to last day of that month
    returnDate.setMonth(returnDate.getMonth() + months - 1);
    // Set to last day of the month
    returnDate.setMonth(returnDate.getMonth() + 1, 0);
  } else {
    // Start date is 8-31: add months normally
    // Then set to last day of that month
    returnDate.setMonth(returnDate.getMonth() + months);
    // Set to last day of the month
    returnDate.setMonth(returnDate.getMonth() + 1, 0);
  }
  
  return returnDate;
};

export function EquipmentRentalsModal({
  open,
  onOpenChange,
  onSave,
  customerId,
  location,
  rentalId,
  onReprintAgreement,
  onEquipmentReturned,
}: EquipmentRentalsModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [returning, setReturning] = useState(false);
  const [availableInstruments, setAvailableInstruments] = useState<
    InstrumentRental[]
  >([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  const [formData, setFormData] = useState<EquipmentRentalFormData>({
    customer: "",
    address: "",
    city: "",
    postalCode: "",
    homePhone: "",
    workPhone: "",
    otherPhone: "",
    email: "",
    studentId: "",
    rentalStartDate: new Date(),
    onGoing: false,
    duration: "",
    returnDate: undefined,
    securityDeposit: "no",
    tenderType: "",
    depositAmount: "",
  });

  const [instruments, setInstruments] = useState<InstrumentData[]>([]);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);

  const [newInstrument, setNewInstrument] = useState<InstrumentData>({
    id: "new",
    instrumentId: 0,
    instrumentCode: "",
    instrument: "",
    retailValue: "",
    assetTag: "",
    monthlyRate: "0",
    numberOfMonths: "1",
    total: "0.00",
  });

  const isEditMode = Boolean(rentalId);

  const fetchEquipmentRentalsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = rentalId
        ? await getEquipmentRentalsInfoForUpdate(location, customerId, rentalId)
        : await getEquipmentRentalsInfo(location, customerId);

      if (response && response.success) {
        const { instrumentRentals, students, customerInfo } =
          response.data.body;

        // Set available instruments from API response
        setAvailableInstruments(instrumentRentals);

        // Set available students from API response
        setAvailableStudents(students);

        // Populate form with customer info from API
        setFormData((prev) => ({
          ...prev,
          customer: customerInfo.customerName || "",
          address: customerInfo.address || "",
          city: customerInfo.city || "",
          postalCode: customerInfo.postalCode || "",
          homePhone: customerInfo.homePhone || "",
          workPhone: customerInfo.workPhone || "",
          otherPhone: customerInfo.otherPhone || "",
          email: customerInfo.email || "",
          studentId: students.length > 0 ? students[0].id.toString() : "",
        }));
      } else {
        toast.error(
          response?.message || "Failed to load equipment rental data"
        );
      }
    } catch (error) {
      console.error("Error fetching equipment rentals data:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [location, customerId, rentalId]);

  useEffect(() => {
    if (open) {
      fetchEquipmentRentalsData();
    }
  }, [open, fetchEquipmentRentalsData]);

  const handleInputChange = (
    field: keyof EquipmentRentalFormData,
    value: string | boolean | Date
  ) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      if (field === "onGoing") {
        if (value === true) {
          newData.duration = "";
          newData.returnDate = undefined;
        } else {
          // When unchecking onGoing, calculate return date if we have start date and duration
          if (newData.rentalStartDate && newData.duration) {
            const durationMatch = newData.duration.match(/^(\d+)-month/);
            if (durationMatch) {
              const months = parseInt(durationMatch[1]);
              if (!isNaN(months) && months > 0) {
                newData.returnDate = calculateReturnDate(newData.rentalStartDate, months);
              }
            }
          }
        }
      }

      // Calculate return date when rental start date or duration changes
      if (
        (field === "rentalStartDate" || field === "duration") &&
        !newData.onGoing
      ) {
        if (newData.rentalStartDate && newData.duration) {
          const durationMatch = newData.duration.match(/^(\d+)-month/);
          if (durationMatch) {
            const months = parseInt(durationMatch[1]);
            if (!isNaN(months) && months > 0) {
              newData.returnDate = calculateReturnDate(newData.rentalStartDate, months);
            } else {
              newData.returnDate = undefined;
            }
          } else {
            newData.returnDate = undefined;
          }
        } else {
          newData.returnDate = undefined;
        }
      }

      return newData;
    });
  };

  const handleNewInstrumentChange = (
    field: keyof InstrumentData,
    value: string
  ) => {
    setNewInstrument((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      if (field === "monthlyRate" || field === "numberOfMonths") {
        const monthlyRate = parseFloat(updated.monthlyRate || "0");
        const numberOfMonths = parseFloat(updated.numberOfMonths || "0");
        updated.total = (monthlyRate * numberOfMonths).toFixed(2);
      }

      return updated;
    });
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleAddInstrument = () => {
    if (newInstrument.instrumentId > 0) {
      const instrument: InstrumentData = {
        ...newInstrument,
        id: Date.now().toString(),
        total: (
          parseFloat(newInstrument.monthlyRate) *
          parseFloat(newInstrument.numberOfMonths || "0")
        ).toFixed(2),
      };
      setInstruments((prev) => [...prev, instrument]);
      setNewInstrument({
        id: "new",
        instrumentId: 0,
        instrumentCode: "",
        instrument: "",
        retailValue: "",
        assetTag: "",
        monthlyRate: "0",
        numberOfMonths: "1",
        total: "0.00",
      });
    } else {
      toast.error("Please select an instrument");
    }
  };

  const handleAddCurrentInstrument = () => {
    if (newInstrument.instrumentId > 0) {
      handleAddInstrument();
    }
  };

  const handleDeleteInstrument = (id: string) => {
    setInstruments((prev) => prev.filter((instrument) => instrument.id !== id));
  };

  const handleSave = async () => {
    // Validate form
    if (!formData.studentId) {
      toast.error("Please select a student");
      return;
    }

    if (instruments.length === 0) {
      toast.error("Please add at least one instrument");
      return;
    }

    if (!formData.rentalStartDate) {
      toast.error("Please select a rental start date");
      return;
    }

    try {
      setSaving(true);

      // Extract duration number from "1-month", "2-months", etc.
      const durationMatch = formData.duration.match(/^(\d+)/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 1;

      // Map tenderType string to number
      // Based on the select options: cash -> 1, credit-card -> 2, preauthorized -> 3
      const tenderTypeMap: Record<string, string> = {
        "cash": "1",
        "credit-card": "2",
        "preauthorized": "3",
      };
      const tenderTypeNumber = tenderTypeMap[formData.tenderType] || formData.tenderType || "";

      // Format start date as "MMM dd, yyyy"
      const startDateFormatted = format(formData.rentalStartDate, "MMM dd, yyyy");

      // Format return date as ISO string
      let returnDateISO = "";
      if (formData.returnDate) {
        returnDateISO = formData.returnDate.toISOString();
      } else if (!formData.onGoing && formData.rentalStartDate) {
        // Calculate return date from start date and duration using the new logic
        const calculatedReturnDate = calculateReturnDate(formData.rentalStartDate, duration);
        returnDateISO = calculatedReturnDate.toISOString();
      }

      // Map instruments to API format
      const mappedInstruments = instruments.map((instrument) => ({
        instrumentId: instrument.instrumentId,
        retailValue: instrument.retailValue || "",
        assetTag: instrument.assetTag || "",
        monthlyRate: instrument.monthlyRate || "0",
        numberOfMonths: instrument.numberOfMonths || "0",
        total: instrument.total || "0.00",
      }));

      const subTotal = instruments.reduce(
        (sum, instrument) => sum + parseFloat(instrument.total || "0"),
        0
      );
      const hst = subTotal * 0.13;
      const instrumentsTotal = subTotal + hst;

      const response = await createEquipmentRental(
        location,
        customerId,
        {
          userId: customerId,
          customerName: formData.customer,
          studentId: parseInt(formData.studentId),
          startDate: startDateFormatted,
          isOnGoing: formData.onGoing,
          duration: duration,
          returnDate: returnDateISO,
          securityDeposit: formData.securityDeposit,
          tenderType: tenderTypeNumber,
          depositAmount: formData.depositAmount || "",
          instruments: mappedInstruments,
          subTotal: subTotal,
          hst: hst,
          instrumentsTotal: instrumentsTotal,
        }
      );

      if (response.status) {
        toast.success("Equipment rental created successfully");
        onOpenChange(false);
        // Call onSave callback if provided (for parent component to refresh data)
        if (onSave) {
          onSave({
            ...formData,
            instruments,
          });
        }
      } else {
        const errorMessage = response.errors?.join(", ") || "Failed to create equipment rental";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create equipment rental";
      toast.error(errorMessage);
      console.error("Error creating equipment rental:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReprintAgreement = () => {
    if (!rentalId) return;
    if (onReprintAgreement) return onReprintAgreement(rentalId);
    toast.success("Reprint Agreement triggered");
  };

  const handleEquipmentReturned = async () => {
    if (!rentalId) return;

    try {
      setReturning(true);

      // Get student name from availableStudents
      const selectedStudent = availableStudents.find(
        (s) => s.id.toString() === formData.studentId
      );
      const studentName = selectedStudent?.fullName || "";

      if (!studentName) {
        toast.error("Student information not found");
        return;
      }

      // Use today's date as return date (or could allow user to select)
      const returnDate = new Date();
      const returnDateFormatted = format(returnDate, "MMM dd, yyyy"); // For URL: "Oct 30, 2025"
      const returnDateISO = format(returnDate, "yyyy-MM-dd"); // For form data: "2025-10-30"

      // Map instruments from state to API format
      // Note: In edit mode, we might not have instruments in state
      // If instruments array is empty, we'll send empty instrument data
      const mappedInstruments = instruments.length > 0
        ? instruments.map((instrument) => {
            const instrumentTotal = parseFloat(instrument.total || "0");
            const instrumentTax = (instrumentTotal * 0.13).toFixed(2);
            return {
              value: "", // Empty string for retail value
              asset: "", // Empty string for asset tag
              price: instrument.monthlyRate || "0",
              duration: instrument.numberOfMonths || "0",
              total: instrument.total || "0.00",
              tax: instrumentTax,
            };
          })
        : [
            // Default empty instrument if no instruments in state
            // This might happen in edit mode where instruments are not loaded into state
            {
              value: "",
              asset: "",
              price: "0",
              duration: "0",
              total: "0.00",
              tax: "0.00",
            },
          ];

      const response = await equipmentReturned(
        location,
        rentalId,
        returnDateFormatted,
        {
          userId: customerId,
          customerName: formData.customer,
          studentName: studentName,
          returnDate: returnDateISO,
          securityDeposit: "",
          tenderType: "",
          depositAmount: "0.00",
          instruments: mappedInstruments,
        }
      );

      if (response.status) {
        toast.success("Equipment marked as returned successfully");
        // Close modal and call callback if provided
        onOpenChange(false);
        if (onEquipmentReturned) {
          onEquipmentReturned(rentalId);
        }
      } else {
        const errorMessage =
          response.errors?.join(", ") ||
          "Failed to mark equipment as returned";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to mark equipment as returned";
      toast.error(errorMessage);
      console.error("Error marking equipment as returned:", error);
    } finally {
      setReturning(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const subTotal = instruments.reduce(
    (sum, instrument) => sum + parseFloat(instrument.total || "0"),
    0
  );
  const tax = subTotal * 0.13;
  const total = subTotal + tax;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-semibold">
              {rentalId ? "Update Equipment Rental" : "Equipment Rentals"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-4 p-6 ml-5">
              {/* Customer Name Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>

              {/* Address Row Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-10 w-48" />
              </div>

              {/* Phone Row Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>

              {/* Email Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>

              {/* Student Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>

              {/* Rental Start Date Skeleton */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-20 ml-6" />
              </div>

              {/* Duration Skeleton */}
              <div className="flex items-center p-5 gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-24 ml-6" />
                <Skeleton className="h-10 w-48" />
              </div>

              {/* Security Deposit Skeleton */}
              <div className="flex items-start p-5 gap-4">
                <Skeleton className="h-6 w-48" />
                <div className="flex flex-col space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>

            {/* Instrument Details Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 p-6 pt-4 border-t dark:border-gray-700 bg-background">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {rentalId ? "Update Equipment Rental" : "Equipment Rentals"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          <div className="space-y-4 p-6 ml-5">
            <div className="flex items-center gap-4">
              <Label className="w-24">Customer</Label>
              <Input
                value={formData.customer}
                onChange={(e) => handleInputChange("customer", e.target.value)}
                className="w-48"
                readOnly={isEditMode}
                disabled={isEditMode}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-24">Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-48"
                readOnly={isEditMode}
                disabled={isEditMode}
              />
              <Label className="w-16">City</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-48"
                readOnly={isEditMode}
                disabled={isEditMode}
              />
              <Label className="w-8">P.C</Label>
              <Input
                value={formData.postalCode}
                onChange={(e) =>
                  handleInputChange("postalCode", e.target.value)
                }
                className="w-48"
                readOnly={isEditMode}
                disabled={isEditMode}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-24">Home Phone</Label>
              <Input
                value={formData.homePhone}
                onChange={(e) => handleInputChange("homePhone", e.target.value)}
                className="w-48"
                readOnly={isEditMode}
                disabled={isEditMode}
              />
              <Label className="w-24">Work Phone</Label>
              <Input
                value={formData.workPhone}
                onChange={(e) => handleInputChange("workPhone", e.target.value)}
                className="w-48"
                readOnly={isEditMode}
                disabled={isEditMode}
              />
              <Label className="w-24">Other Phone</Label>
              <Input
                value={formData.otherPhone}
                onChange={(e) =>
                  handleInputChange("otherPhone", e.target.value)
                }
                className="w-48"
                readOnly={isEditMode}
                disabled={isEditMode}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-24">Email</Label>
              <Input
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-48"
                readOnly={isEditMode}
                disabled={isEditMode}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-24">Student</Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) => handleInputChange("studentId", value)}
                disabled={isEditMode}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-32">Rental Start Date</Label>
              <Popover open={isStartDateOpen && !isEditMode} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-48 justify-start text-left font-normal",
                      !formData.rentalStartDate && "text-muted-foreground"
                    )}
                    disabled={isEditMode}
                  >
                    <CalIcon className="mr-2 h-4 w-4" />
                    {formData.rentalStartDate
                      ? format(formData.rentalStartDate, "MMM dd, yyyy")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.rentalStartDate}
                    onSelect={(date) => {
                      handleInputChange("rentalStartDate", date || new Date());
                      setIsStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center p-5 ml-6 space-x-2">
                <Checkbox
                  id="onGoing"
                  checked={formData.onGoing}
                  onCheckedChange={(checked) =>
                    handleInputChange("onGoing", checked as boolean)
                  }
                  disabled={isEditMode}
                />
                <Label htmlFor="onGoing">On Going</Label>
              </div>
            </div>

            <div className="flex items-center p-5 gap-4">
              <Label className="w-24">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => handleInputChange("duration", value)}
                disabled={formData.onGoing || isEditMode}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem
                      key={i + 1}
                      value={`${i + 1}-month${i > 0 ? "s" : ""}`}
                    >
                      {i + 1} Month{i > 0 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label className="w-24 ml-6">Return Date</Label>
              <Input
                value={
                  formData.returnDate
                    ? format(formData.returnDate, "MMM dd, yyyy")
                    : ""
                }
                readOnly
                disabled={formData.onGoing || isEditMode}
                className="bg-gray-50 dark:bg-gray-800 w-48"
                placeholder={formData.onGoing ? "On Going" : "Select duration"}
              />
            </div>

            <div className="flex items-start p-5 gap-4">
              <Label className="text-lg font-medium w-48">
                Security Deposit
              </Label>
              <RadioGroup
                value={formData.securityDeposit}
                onValueChange={(value) =>
                  handleInputChange("securityDeposit", value as "yes" | "no")
                }
                className={`flex flex-col space-y-2 ${isEditMode ? "opacity-60 pointer-events-none" : ""}`}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>

              {formData.securityDeposit === "yes" && (
                <div className="flex items-center gap-4 ml-8">
                  <Label className="w-24">Tender Type</Label>
                  <Select
                    value={formData.tenderType}
                    onValueChange={(value) =>
                      handleInputChange("tenderType", value)
                    }
                    disabled={isEditMode}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Tender Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Select Tender Type">Select Tender Type</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="preauthorized">Preauthorized</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label className="w-32">Deposit Amount</Label>
                  <Input
                    value={formData.depositAmount}
                    onChange={(e) =>
                      handleInputChange("depositAmount", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-48"
                    readOnly={isEditMode}
                    disabled={isEditMode}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Instrument Details</h3>

            <div className="border rounded-lg overflow-hidden dark:border-gray-700">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="p-3 text-left font-medium">Instrument</th>
                    <th className="p-3 text-left font-medium">Retail Value</th>
                    <th className="p-3 text-left font-medium">
                      Asset Tag/Serial#
                    </th>
                    <th className="p-3 text-left font-medium">Monthly Rate</th>
                    <th className="p-3 text-left font-medium"># Of Months</th>
                    <th className="p-3 text-left font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {!isEditMode && (
                    <InstrumentFormRow
                      newInstrument={newInstrument}
                      onNewInstrumentChange={handleNewInstrumentChange}
                      onInputFocus={handleInputFocus}
                      onInputBlur={handleInputBlur}
                      availableInstruments={availableInstruments}
                    />
                  )}
                  {instruments.map((instrument) => (
                    <tr
                      key={instrument.id}
                      className="border-b dark:border-gray-700"
                    >
                      <td className="p-3 font-medium">
                        {instrument.instrument}
                      </td>
                      <td className="p-3 text-right">
                        {instrument.retailValue}
                      </td>
                      <td className="p-3">{instrument.assetTag}</td>
                      <td className="p-3 text-right">
                        {instrument.monthlyRate}
                      </td>
                      <td className="p-3 text-right">
                        {instrument.numberOfMonths}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium">
                            {instrument.total}
                          </span>
                          {!isEditMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteInstrument(instrument.id)
                            }
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Button onClick={handleAddInstrument} className="w-fit" disabled={isEditMode}>
                Add Instrument
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <Label>Sub Total :</Label>
                <span className="font-medium">${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <Label>Tax :</Label>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t dark:border-gray-700 pt-2">
                <Label>Total :</Label>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className={`w-full flex gap-2 p-6 pt-4 border-t dark:border-gray-700 bg-background ${isEditMode ? "justify-between sm:justify-between" : "justify-end"}`}>
          {isEditMode && (
            <Button onClick={handleReprintAgreement}>Reprint Agreement</Button>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
            {isEditMode ? (
              <Button onClick={handleEquipmentReturned} disabled={returning}>
                {returning ? "Processing..." : "Equipment Returned"}
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Creating..." : "Create"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}