"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
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
import Image from "next/image";
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
import { format, differenceInCalendarDays, differenceInMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getEquipmentRentalsInfo,
  getEquipmentRentalsInfoForUpdate,
  type InstrumentRental,
  type Student,
} from "./Equipment-Rentals.api";
import {
  createEquipmentRental,
  equipmentReturned,
  deleteEquipmentRental,
  updateEquipmentRental,
} from "@/lib/api/legacyApiAdapter";

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
  taxRate: number;
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
  onDelete?: () => void;
  onEmail?: (data: { subject: string; content: string }) => void;
}

const InstrumentFormRow = React.memo(
  ({
    instrument,
    onInstrumentChange,
    onInputFocus,
    onInputBlur,
    availableInstruments,
    onDelete,
    showDelete,
  }: {
    instrument: InstrumentData;
    onInstrumentChange: (
      id: string,
      field: keyof InstrumentData,
      value: string
    ) => void;
    onInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
    onInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    availableInstruments: InstrumentRental[];
    onDelete?: () => void;
    showDelete: boolean;
  }) => {
    return (
      <tr className="border-b dark:border-gray-700">
        <td className="p-2">
          <Select
            value={
              instrument.instrumentId > 0
                ? instrument.instrumentId.toString()
                : ""
            }
            onValueChange={(value) => {
              const selectedInstrument = availableInstruments.find(
                (i) => i.id.toString() === value
              );
              if (selectedInstrument) {
                onInstrumentChange(instrument.id, "instrumentId", value);
                onInstrumentChange(
                  instrument.id,
                  "instrumentCode",
                  selectedInstrument.code
                );
                onInstrumentChange(
                  instrument.id,
                  "instrument",
                  selectedInstrument.description
                );
                onInstrumentChange(
                  instrument.id,
                  "monthlyRate",
                  selectedInstrument.price.toString()
                );
                onInstrumentChange(
                  instrument.id,
                  "taxRate",
                  selectedInstrument.taxRate.toString()
                );
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="--Select an option" />
            </SelectTrigger>
            <SelectContent>
              {availableInstruments.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
        <td className="p-2">
          <Input
            value={instrument.retailValue}
            onChange={(e) =>
              onInstrumentChange(instrument.id, "retailValue", e.target.value)
            }
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            placeholder="0.00"
            className="w-full"
          />
        </td>
        <td className="p-2">
          <Input
            value={instrument.assetTag}
            onChange={(e) =>
              onInstrumentChange(instrument.id, "assetTag", e.target.value)
            }
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            className="w-full"
          />
        </td>
        <td className="p-2">
          <Input
            value={instrument.monthlyRate}
            onChange={(e) =>
              onInstrumentChange(instrument.id, "monthlyRate", e.target.value)
            }
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            placeholder="0"
            className="w-full"
            disabled
          />
        </td>
        <td className="p-2">
          <Input
            value={instrument.numberOfMonths}
            onChange={(e) =>
              onInstrumentChange(
                instrument.id,
                "numberOfMonths",
                e.target.value
              )
            }
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            className="w-full"
            disabled
          />
        </td>
        <td className="p-2">
          <div className="flex items-center justify-end gap-2">
            <Input
              value={instrument.total}
              readOnly
              placeholder="0.00"
              className="w-full bg-gray-50 dark:bg-gray-800"
              disabled
            />
            {showDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  }
);

InstrumentFormRow.displayName = "InstrumentFormRow";

// Base calculation: All months are considered as 30 days for billing purposes
const DAYS_PER_MONTH = 30;

// Tender type mappings
const TENDER_TYPE_MAP: Record<string, string> = {
  cash: "1",
  "credit-card": "2",
  preauthorized: "3",
};

const TENDER_TYPE_REVERSE_MAP: Record<string, string> = {
  "1": "cash",
  "2": "credit-card",
  "3": "preauthorized",
};

const calculateReturnDate = (startDate: Date, months: number): Date => {
  // Normalize start date to remove time component
  const normalizedStart = normalizeDate(startDate);
  const dayOfMonth = normalizedStart.getDate();
  
  // Create a new date object from normalized start date
  const returnDate = new Date(
    normalizedStart.getFullYear(),
    normalizedStart.getMonth(),
    normalizedStart.getDate()
  );

  if (dayOfMonth >= 1 && dayOfMonth <= 7) {
    returnDate.setMonth(returnDate.getMonth() + months - 1);
    returnDate.setMonth(returnDate.getMonth() + 1, 0);
  } else {
    returnDate.setMonth(returnDate.getMonth() + months);
    returnDate.setMonth(returnDate.getMonth() + 1, 0);
  }

  // Return normalized date (no time component)
  return normalizeDate(returnDate);
};

const normalizeDate = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getEndOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

// Calculate minimum return date for ongoing rentals (start date + 30 days)
const getMinimumReturnDate = (startDate: Date): Date => {
  const normalizedStart = normalizeDate(startDate);
  const minimumDate = new Date(normalizedStart);
  minimumDate.setDate(minimumDate.getDate() + 30);
  return normalizeDate(minimumDate);
};

const getOngoingBillingDetails = (startDate: Date) => {
  const normalizedStart = normalizeDate(startDate);
  const dayOfMonth = normalizedStart.getDate();
  const endOfMonth = getEndOfMonth(normalizedStart);
  
  let totalDays: number;
  let returnDate: Date;
  
  if (dayOfMonth >= 1 && dayOfMonth <= 7) {
    // Days 1-7: consider 30 days from start date
    totalDays = DAYS_PER_MONTH;
    returnDate = new Date(normalizedStart);
    returnDate.setDate(returnDate.getDate() + DAYS_PER_MONTH);
  } else {
    // Days 8 onwards: consider 30 days + remaining days in current month
    const remainingDays = Math.max(
      differenceInCalendarDays(normalizeDate(endOfMonth), normalizedStart) + 1,
      0
    );
    totalDays = DAYS_PER_MONTH + remainingDays;
    // Return date is start date + total days
    returnDate = new Date(normalizedStart);
    returnDate.setDate(returnDate.getDate() + totalDays);
  }
  
  return {
    totalDays,
    endOfMonth,
    returnDate: normalizeDate(returnDate),
  };
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
  onDelete,
  onEmail,
}: EquipmentRentalsModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [returning, setReturning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  interface CreatedRentalData {
    customerName: string;
    customerAddress: string;
    customerCity: string;
    customerPostalCode: string;
    homePhone: string;
    workPhone: string;
    otherPhone: string;
    email: string;
    studentFirstName: string;
    studentLastName: string;
    startDate: string;
    duration: number;
    returnDate: string | null;
    instruments: InstrumentData[];
    subTotal: number;
    hst: number;
    total: number;
    location: string;
  }

  const [createdRentalData, setCreatedRentalData] =
    useState<CreatedRentalData | null>(null);
  const [availableInstruments, setAvailableInstruments] = useState<
    InstrumentRental[]
  >([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [rentalCreatedOn, setRentalCreatedOn] = useState<Date | null>(null);

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
    rentalStartDate: undefined,
    onGoing: false,
    duration: "",
    returnDate: undefined,
    securityDeposit: "no",
    tenderType: "",
    depositAmount: "",
  });

  const [instruments, setInstruments] = useState<InstrumentData[]>([
    {
      id: "initial",
      instrumentId: 0,
      instrumentCode: "",
      instrument: "",
      retailValue: "",
      assetTag: "",
      monthlyRate: "0",
      numberOfMonths: "1",
      total: "0.00",
      taxRate: 0, // Default tax rate, will be updated from API when instrument is selected
    },
  ]);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isReturnDateOpen, setIsReturnDateOpen] = useState(false);

  const isEditMode = Boolean(rentalId);

  const updateInstrumentsForOngoing = useCallback(
    (startDate: Date) => {
      const { totalDays } = getOngoingBillingDetails(startDate);

      setInstruments((prev) =>
        prev.map((inst) => {
          const monthlyRate = parseFloat(inst.monthlyRate || "0");

          if (monthlyRate <= 0) {
            return {
              ...inst,
              numberOfMonths: "1", // Set to 1 month for ongoing rentals
              total: "0.00",
            };
          }

          // Calculate per day rate based on 30 days per month
          const perDayRate = monthlyRate / DAYS_PER_MONTH;
          const total = perDayRate * totalDays;

          return {
            ...inst,
            numberOfMonths: "1", // Set to 1 month for ongoing rentals
            total: total.toFixed(2),
          };
        })
      );
    },
    []
  );

  const fetchEquipmentRentalsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = rentalId
        ? await getEquipmentRentalsInfoForUpdate(location, customerId, rentalId)
        : await getEquipmentRentalsInfo(location, customerId);

      if (response && response.success) {
        const {
          instrumentRentals,
          students,
          customerInfo,
          rentedInstruments,
          rentalDetails,
        } = response.data.body;

        setAvailableInstruments(instrumentRentals);
        setAvailableStudents(students);

        let rentalStartDate: Date | undefined;
        let returnDate: Date | undefined;
        let duration: string = "";
        let onGoing: boolean = false;
        let studentId: string = "";

        if (rentalId && rentalDetails) {
          rentalStartDate = rentalDetails.startDate
            ? new Date(rentalDetails.startDate + "T00:00:00")
            : new Date();
          duration = rentalDetails.duration
            ? `${rentalDetails.duration}-month${
                rentalDetails.duration > 1 ? "s" : ""
              }`
            : "";
          onGoing =
            rentalDetails.isOnGoing !== undefined &&
            rentalDetails.isOnGoing !== null
              ? Boolean(rentalDetails.isOnGoing)
              : false;
          studentId = rentalDetails.studentId?.toString() || "";

          // If "On Going" is true, clear duration
          // In edit mode, preserve returnDate from API if it exists (user may want to set it)
          if (onGoing) {
            duration = "";
            // In edit mode, preserve returnDate from API if it exists
            if (isEditMode && rentalDetails.returnDate) {
              returnDate = new Date(rentalDetails.returnDate + "T00:00:00");
            } else {
              returnDate = undefined; // Clear return date for ongoing rentals in create mode
            }
          } else {
            // Only set return date if NOT "On Going"
            returnDate = rentalDetails.returnDate
              ? new Date(rentalDetails.returnDate + "T00:00:00")
              : undefined;

            if (
              !returnDate &&
              rentalDetails.startDate &&
              rentalDetails.duration
            ) {
              returnDate = calculateReturnDate(
                new Date(rentalDetails.startDate + "T00:00:00"),
                rentalDetails.duration
              );
            }
          }
          
          // Final safeguard: If onGoing is true and NOT in edit mode, ensure returnDate is undefined
          if (onGoing && !isEditMode) {
            returnDate = undefined;
          }
        } else {
          rentalStartDate = undefined;
          returnDate = undefined;
          duration = "";
          onGoing = false;
          studentId = "";
        }

        const newFormData: EquipmentRentalFormData = {
          customer: customerInfo.customerName || "",
          address: customerInfo.address || "",
          city: customerInfo.city || "",
          postalCode: customerInfo.postalCode || "",
          homePhone: customerInfo.homePhone || "",
          workPhone: customerInfo.workPhone || "",
          otherPhone: customerInfo.otherPhone || "",
          email: customerInfo.email || "",
          studentId: rentalId && rentalDetails ? studentId : "",
          rentalStartDate: rentalStartDate,
          onGoing: onGoing,
          duration: onGoing ? "" : duration, // Clear duration if onGoing is true
          returnDate: onGoing && !isEditMode ? undefined : returnDate, // Clear returnDate if onGoing is true (only in create mode)
          securityDeposit:
            rentalDetails?.securityDeposit !== undefined &&
            rentalDetails?.securityDeposit !== null
              ? Boolean(rentalDetails.securityDeposit)
                ? "yes"
                : "no"
              : "no",
          tenderType: rentalDetails?.tenderType
            ? TENDER_TYPE_REVERSE_MAP[rentalDetails.tenderType.toString()] || rentalDetails.tenderType.toString()
            : "",
          depositAmount: rentalDetails?.depositAmount || "",
        };

        // If onGoing is true, ensure returnDate is undefined in newFormData (only in create mode)
        // In edit mode, allow returnDate to be set for ongoing rentals
        // CRITICAL: Must be done BEFORE setting formData to prevent any calculations
        if (onGoing && !isEditMode) {
          newFormData.returnDate = undefined;
          newFormData.duration = "";
        }
        
        // Use flushSync to ensure state updates synchronously so useMemo computes correctly
        flushSync(() => {
          setFormData(newFormData);
        });

        // Additional safeguard: ensure returnDate is cleared if onGoing is true - run immediately (only in create mode)
        if (onGoing && !isEditMode) {
          flushSync(() => {
            setFormData((prev) => {
              if (prev.onGoing === true) {
                return {
                  ...prev,
                  returnDate: undefined,
                  duration: "",
                };
              }
              return prev;
            });
          });
        }

        if (rentalId && rentalDetails?.createdOn) {
          setRentalCreatedOn(new Date(rentalDetails.createdOn + "T00:00:00"));
        } else {
          setRentalCreatedOn(null);
        }

        if (rentalId && rentedInstruments && rentedInstruments.length > 0) {
          const mappedInstruments: InstrumentData[] = rentedInstruments.map(
            (inst, index) => {
              // Find the taxRate from available instruments by matching instrumentId
              const availableInstrument = instrumentRentals.find(
                (ai) => ai.id === inst.instrumentId
              );
              const taxRate = availableInstrument?.taxRate ?? 0; // Use instrument's taxRate or 0 if not found
              const {instrumentId, instrumentCode, instrument, retailValue, assetTag, monthlyRate, numberOfMonths, total} = inst;
              return {
                id: `rented-${instrumentId}-${index}`,
                instrumentId: instrumentId,
                instrumentCode: instrumentCode,
                instrument: instrument,
                retailValue: retailValue || "",
                assetTag: assetTag || "",
                monthlyRate: monthlyRate || "0",
                numberOfMonths: onGoing ? "1" : (numberOfMonths || ""), // Set to 1 month for ongoing rentals
                total: total || "0.00",
                taxRate: taxRate,
              };
            }
          );
          setInstruments(mappedInstruments);
        } else if (rentalId) {
          setInstruments([]);
        } else {
          // Get default taxRate from first available instrument or use 0 as fallback
          const defaultTaxRate = instrumentRentals.length > 0 ? instrumentRentals[0].taxRate : 0;
          setInstruments([
            {
              id: "initial",
              instrumentId: 0,
              instrumentCode: "",
              instrument: "",
              retailValue: "",
              assetTag: "",
              monthlyRate: "0",
              numberOfMonths: "1",
              total: "0.00",
              taxRate: defaultTaxRate,
            },
          ]);
        }
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

  useEffect(() => {
    if (
      !formData.onGoing &&
      formData.rentalStartDate &&
      formData.returnDate &&
      instruments.length > 0
    ) {
      const hasInstrumentsWithRates = instruments.some(
        (inst) =>
          inst.instrumentId > 0 && parseFloat(inst.monthlyRate || "0") > 0
      );
      if (hasInstrumentsWithRates) {
        recalculateInstrumentTotalsFromDates(
          formData.rentalStartDate,
          formData.returnDate,
          formData.duration
        );
      }
    }
  }, [
    formData.rentalStartDate,
    formData.returnDate,
    formData.duration,
    formData.onGoing,
  ]);

  useEffect(() => {
    if (formData.onGoing && formData.rentalStartDate) {
      updateInstrumentsForOngoing(formData.rentalStartDate);
    }
  }, [formData.onGoing, formData.rentalStartDate, updateInstrumentsForOngoing]);

  // Clear returnDate and duration when onGoing is true - MUST run when onGoing changes or when returnDate/duration are set while onGoing is true
  // BUT: In edit mode, allow setting returnDate for ongoing rentals
  useEffect(() => {
    if (formData.onGoing === true && !isEditMode) {
      // ALWAYS clear returnDate and duration when onGoing is true (only in create mode)
      // Use flushSync to ensure immediate update
      setFormData((prev) => {
        // Only update if returnDate or duration need to be cleared
        if (prev.onGoing === true && (prev.returnDate !== undefined || (prev.duration && prev.duration !== ""))) {
          return {
            ...prev,
            returnDate: undefined,
            duration: "",
          };
        }
        return prev;
      });
    }
  }, [formData.onGoing, formData.returnDate, formData.duration, isEditMode]);

  // Compute return date input value
  // In edit mode with ongoing rental, show returnDate if it exists
  const returnDateInputValue = useMemo(() => {
    // In edit mode with ongoing rental, allow showing returnDate
    if (formData.onGoing === true && isEditMode) {
      // Show returnDate if it exists
      if (formData.returnDate && formData.returnDate instanceof Date && !isNaN(formData.returnDate.getTime())) {
        return format(formData.returnDate, "MMM dd, yyyy");
      }
      return "";
    }
    // In create mode or non-ongoing: if onGoing is true, return empty string
    if (formData.onGoing === true) {
      return "";
    }
    // Only format date if onGoing is false AND returnDate exists AND is valid
    if (formData.returnDate && formData.returnDate instanceof Date && !isNaN(formData.returnDate.getTime())) {
      return format(formData.returnDate, "MMM dd, yyyy");
    }
    // Default: return empty string
    return "";
  }, [formData.onGoing, formData.returnDate, isEditMode]);

  const calculateTotalFromDates = (
    startDate: Date,
    returnDate: Date,
    monthlyRate: number,
    duration?: string
  ): string => {
    if (!startDate || !returnDate || monthlyRate <= 0) {
      return "0.00";
    }

    // Ensure dates are normalized (no time component)
    const normalizedStart = normalizeDate(startDate);
    const normalizedReturn = normalizeDate(returnDate);
    
    // All months are considered as 30 days for billing purposes
    const daysPerMonth = DAYS_PER_MONTH;
    const perDayRate = monthlyRate / daysPerMonth;

    // Calculate calendar days between dates
    const calendarDays = differenceInCalendarDays(normalizedReturn, normalizedStart);
    
    // Day calculation logic varies by duration:
    // - 1 month: Use calendar days as-is (include return date)
    // - 2 months: Exclude return date (subtract 1)
    // - 3 months: Include both start and end dates (add 1)
    // - 4+ months: Use calendar days as-is (no change)
    // Parse duration - handle both "6-month" and "6-months" formats (case-insensitive)
    let durationMonths: number | null = null;
    if (duration) {
      // Try to match "6-month" or "6-months" (case-insensitive)
      const durationMatch = duration.match(/^(\d+)-month/i);
      if (durationMatch) {
        durationMonths = parseInt(durationMatch[1], 10);
      }
    }
    
    let actualDays: number;
    if (!durationMonths || durationMonths === 1) {
      // Single month or no duration: use calendar days as-is
      actualDays = Math.max(calendarDays, 0);
    } else if (durationMonths === 2) {
      // 2 months: exclude return date (subtract 1)
      actualDays = Math.max(calendarDays - 1, 0);
    } else if (durationMonths === 3) {
      // 3 months: include both start and end dates (add 1)
      actualDays = Math.max(calendarDays + 1, 0);
    } else {
      // 4+ months: If start date is on or after the 8th, count from the next day (9th)
      // This gives: 30 days base + remaining days from start month (from 9th) + remaining days to end date
      const startDayOfMonth = normalizedStart.getDate();
      if (startDayOfMonth >= 8) {
        // Start counting from the next day (9th)
        const adjustedStart = new Date(
          normalizedStart.getFullYear(),
          normalizedStart.getMonth(),
          normalizedStart.getDate() + 1
        );
        const baseDays = differenceInCalendarDays(
          normalizedReturn,
          adjustedStart
        );
        
        // Apply adjustment based on duration months
        // Pattern: 4-5 months: +1, 6-7 months: 0, 8 months: -1, 9-10 months: -2, 11-12 months: -3
        // For months > 12, continue the pattern: subtract (months - 7) for 13+, or use -3 as base
        let adjustment = 0;
        if (durationMonths === 4 || durationMonths === 5) {
          adjustment = 1;
        } else if (durationMonths === 6 || durationMonths === 7) {
          adjustment = 0;
        } else if (durationMonths === 8) {
          adjustment = -1;
        } else if (durationMonths === 9 || durationMonths === 10) {
          adjustment = -2;
        } else if (durationMonths === 11 || durationMonths === 12) {
          adjustment = -3;
        } else if (durationMonths > 12) {
          // For months > 12, continue pattern: -3 for 12, so -4 for 13, -5 for 14, etc.
          adjustment = -(durationMonths - 9);
        }
        
        actualDays = Math.max(baseDays + adjustment, 0);
      } else {
        // Start date is before 8th, use expected days (durationMonths × 30 days)
        actualDays = durationMonths * daysPerMonth;
      }
    }

    const calculateProratedTotal = (days: number) => {
      // Minimum charge based on DAYS_PER_MONTH (30 days)
      const billableDays = Math.max(days, daysPerMonth);
      const total = billableDays * perDayRate;
      return total.toFixed(2);
    };

    // If no duration specified, use prorated calculation with minimum DAYS_PER_MONTH (30 days)
    if (!duration || !durationMonths) {
      return calculateProratedTotal(actualDays);
    }

    // Calculate minimum charge based on DAYS_PER_MONTH (30 days per month)
    // Each month is considered as DAYS_PER_MONTH (30) days for billing purposes
    const minimumCharge = monthlyRate * durationMonths;
    const expectedDays = durationMonths * daysPerMonth; // durationMonths × DAYS_PER_MONTH

    // If actual rental days exceed expected days (based on DAYS_PER_MONTH), charge for extra days
    if (actualDays > expectedDays) {
      const extraDays = actualDays - expectedDays;
      const extraCharge = extraDays * perDayRate;
      const total = minimumCharge + extraCharge;
      return total.toFixed(2);
    }

    // If actual days are less than or equal to expected days (DAYS_PER_MONTH), charge minimum only
    return minimumCharge.toFixed(2);
  };

  const recalculateInstrumentTotalsFromDates = (
    startDate: Date | undefined,
    returnDate: Date | undefined,
    duration?: string
  ) => {
    if (!startDate || !returnDate) {
      return;
    }

    setInstruments((prev) =>
      prev.map((inst) => {
        if (inst.instrumentId === 0 || !inst.monthlyRate) {
          return inst;
        }

        const monthlyRate = parseFloat(inst.monthlyRate || "0");
        if (monthlyRate <= 0) {
          return inst;
        }

        const total = calculateTotalFromDates(
          startDate,
          returnDate,
          monthlyRate,
          duration
        );
        return {
          ...inst,
          total: total,
        };
      })
    );
  };

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
          // Clear both duration and return date when "On Going" is checked
          // BUT: In edit mode, allow returnDate to be set for ongoing rentals
          newData.duration = "";
          if (!isEditMode) {
            newData.returnDate = undefined;
          }
          
          // Set numberOfMonths to "1" for all instruments when "On Going" is checked
          setTimeout(() => {
            setInstruments((prevInstruments) =>
              prevInstruments.map((inst) => ({
                ...inst,
                numberOfMonths: "1", // Set to 1 month for ongoing rentals
              }))
            );
          }, 0);
          
          updateInstrumentsForOngoing(
            newData.rentalStartDate instanceof Date
              ? newData.rentalStartDate
              : new Date()
          );
        } else {
          // When unchecking "On Going", always restore to "1-month" (not the previous duration)
          // This is the expected behavior: regardless of what duration was selected before
          // checking "On Going", unchecking should always set to "1-month"
          const restoredDuration = "1-month";
          const restoredMonths = 1;
          newData.duration = restoredDuration;
          
          // Always recalculate return date from current start date and restored duration
          // This ensures the total reflects the current dates, not previous dates
          if (restoredDuration && newData.rentalStartDate && restoredMonths) {
            // Recalculate return date from current start date and restored duration
            // This way, even if start date changed while "On Going" was checked,
            // the return date will be based on the current start date
            if (!isNaN(restoredMonths) && restoredMonths > 0) {
              newData.returnDate = calculateReturnDate(
                newData.rentalStartDate,
                restoredMonths
              );
            }
          }

          setTimeout(() => {
            // Update numberOfMonths in instruments based on restored duration
            if (restoredMonths && !isNaN(restoredMonths) && restoredMonths > 0) {
              setInstruments((prevInstruments) =>
                prevInstruments.map((inst) => ({
                  ...inst,
                  numberOfMonths: restoredMonths!.toString(),
                }))
              );
            }

            // Recalculate totals if we have valid dates
            if (
              newData.rentalStartDate &&
              newData.returnDate &&
              instruments.length > 0
            ) {
              recalculateInstrumentTotalsFromDates(
                newData.rentalStartDate as Date,
                newData.returnDate as Date,
                restoredDuration || newData.duration
              );
            } else if (restoredMonths && !isNaN(restoredMonths)) {
              // Fallback: calculate from monthly rate * months
              setInstruments((prevInstruments) =>
                prevInstruments.map((inst) => {
                  const monthlyRate = parseFloat(inst.monthlyRate || "0");
                  if (monthlyRate > 0) {
                    return {
                      ...inst,
                      numberOfMonths: restoredMonths!.toString(),
                      total: (monthlyRate * restoredMonths!).toFixed(2),
                    };
                  }
                  return {
                    ...inst,
                    numberOfMonths: restoredMonths!.toString(),
                    total: "0.00",
                  };
                })
              );
            }
          }, 0);
        }
      }

      // Handle start date changes when "On Going" is checked
      if (field === "rentalStartDate" && newData.onGoing) {
        // Keep return date blank when "On Going" is checked (only in create mode)
        // In edit mode, allow returnDate to be set for ongoing rentals
        // Only update instruments for ongoing billing calculation
        if (newData.rentalStartDate instanceof Date) {
          // Update instruments when start date changes (for ongoing billing)
          updateInstrumentsForOngoing(newData.rentalStartDate);
        }
        // Return date should remain blank/undefined for ongoing rentals (only in create mode)
        if (!isEditMode) {
          newData.returnDate = undefined;
        }
      }

      // Handle start date changes when "On Going" is NOT checked
      if (field === "rentalStartDate" && !newData.onGoing) {
        if (newData.rentalStartDate instanceof Date) {
          // If duration is not selected yet, set return date to last day of the month
          if (!newData.duration || newData.duration === "") {
            newData.returnDate = getEndOfMonth(newData.rentalStartDate);
          } else {
            // If duration is already selected, recalculate based on duration
            const durationMatch = newData.duration.match(/^(\d+)-month/i);
            if (durationMatch) {
              const months = parseInt(durationMatch[1]);
              if (!isNaN(months) && months > 0) {
                newData.returnDate = calculateReturnDate(
                  newData.rentalStartDate,
                  months
                );
              } else {
                // Fallback to last day of month if duration is invalid
                newData.returnDate = getEndOfMonth(newData.rentalStartDate);
              }
            } else {
              // Fallback to last day of month if duration format is invalid
              newData.returnDate = getEndOfMonth(newData.rentalStartDate);
            }
          }
        } else {
          newData.returnDate = undefined;
        }
      }

      // Handle duration changes when "On Going" is NOT checked
      if (field === "duration" && !newData.onGoing) {
        const durationMatch = String(value).match(/^(\d+)-month/i);
        if (durationMatch && newData.rentalStartDate instanceof Date) {
          const months = parseInt(durationMatch[1]);
          if (!isNaN(months) && months > 0) {
            // Calculate return date based on duration
            newData.returnDate = calculateReturnDate(
              newData.rentalStartDate,
              months
            );
          } else {
            // If duration is invalid, set to last day of month
            newData.returnDate = getEndOfMonth(newData.rentalStartDate);
          }
        } else if (newData.rentalStartDate instanceof Date) {
          // If duration is cleared or invalid, set to last day of month
          newData.returnDate = getEndOfMonth(newData.rentalStartDate);
        } else {
          newData.returnDate = undefined;
        }
      }

      if (field === "duration" && !newData.onGoing) {
        const durationMatch = String(value).match(/^(\d+)-month/i);
        if (durationMatch) {
          const months = parseInt(durationMatch[1]);
          // Update numberOfMonths in instruments immediately
          // The useEffect will handle recalculation when return date is set
          setTimeout(() => {
            setInstruments((prev) =>
              prev.map((inst) => ({
                ...inst,
                numberOfMonths: months.toString(),
              }))
            );
          }, 0);
        }
      }

      if (
        (field === "rentalStartDate" || field === "returnDate") &&
        !newData.onGoing &&
        newData.rentalStartDate &&
        newData.returnDate
      ) {
        setTimeout(() => {
          recalculateInstrumentTotalsFromDates(
            newData.rentalStartDate,
            newData.returnDate,
            newData.duration
          );
        }, 0);
      }

      // Final safeguard: If "On Going" is checked, ensure duration and return date are blank
      // BUT: In edit mode, allow setting returnDate for ongoing rentals
      if (newData.onGoing && !isEditMode) {
        newData.duration = "";
        newData.returnDate = undefined;
      }

      return newData;
    });
  };

  const handleInstrumentChange = (
    id: string,
    field: keyof InstrumentData,
    value: string
  ) => {
    setInstruments((prev) => {
      return prev.map((inst) => {
        if (inst.id !== id) return inst;

        const updated = {
          ...inst,
          [field]: field === "taxRate" ? (isNaN(parseFloat(value)) ? 0 : parseFloat(value)) : value,
        };

        // When instrument is selected, set numberOfMonths from duration
        if (field === "instrumentId") {
          const durationMatch = formData.duration.match(/^(\d+)-month/i);
          if (durationMatch) {
            updated.numberOfMonths = durationMatch[1];
          } else if (formData.onGoing) {
            updated.numberOfMonths = "1"; // Set to 1 month for ongoing rentals
          }
        }

        if (field === "monthlyRate" || field === "numberOfMonths") {
          const monthlyRate = parseFloat(updated.monthlyRate || "0");

          if (formData.onGoing && formData.rentalStartDate) {
            if (monthlyRate > 0) {
              const { totalDays } = getOngoingBillingDetails(
                formData.rentalStartDate
              );
              // Calculate per day rate based on 30 days per month
              const perDayRate = monthlyRate / DAYS_PER_MONTH;
              updated.total = (perDayRate * totalDays).toFixed(2);
            } else {
              updated.total = "0.00";
            }

            // Set numberOfMonths to "1" for ongoing rentals
            updated.numberOfMonths = "1";
          } else if (
            !formData.onGoing &&
            formData.rentalStartDate &&
            formData.returnDate &&
            monthlyRate > 0
          ) {
            updated.total = calculateTotalFromDates(
              formData.rentalStartDate,
              formData.returnDate,
              monthlyRate,
              formData.duration
            );
          } else {
            const numberOfMonths = parseFloat(updated.numberOfMonths || "0");
            if (
              !isNaN(monthlyRate) &&
              !isNaN(numberOfMonths) &&
              numberOfMonths > 0
            ) {
              updated.total = (monthlyRate * numberOfMonths).toFixed(2);
            } else {
              updated.total = "0.00";
            }
          }
        }

        return updated;
      });
    });
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleAddAnotherInstrument = () => {
    // Get current numberOfMonths from duration or default to 1
    let numberOfMonths = "1";
    if (formData.onGoing) {
      numberOfMonths = "1"; // Set to 1 month for ongoing rentals
    } else if (formData.duration) {
      const durationMatch = formData.duration.match(/^(\d+)-month/i);
      if (durationMatch) {
        numberOfMonths = durationMatch[1];
      }
    }

    // Get default taxRate from first available instrument or use 0 as fallback
    const defaultTaxRate = availableInstruments.length > 0 ? availableInstruments[0].taxRate : 0;

    const newInstrument: InstrumentData = {
      id: Date.now().toString(),
      instrumentId: 0,
      instrumentCode: "",
      instrument: "",
      retailValue: "",
      assetTag: "",
      monthlyRate: "0",
      numberOfMonths: numberOfMonths,
      total: "0.00",
      taxRate: defaultTaxRate,
    };
    setInstruments((prev) => [...prev, newInstrument]);
  };

  const handleDeleteInstrument = (id: string) => {
    setInstruments((prev) => {
      const filtered = prev.filter((instrument) => instrument.id !== id);
      if (filtered.length === 0) {
        let numberOfMonths = "1";
        if (formData.onGoing) {
          numberOfMonths = "1"; // Set to 1 month for ongoing rentals
        } else if (formData.duration) {
          const durationMatch = formData.duration.match(/^(\d+)-month/i);
          if (durationMatch) {
            numberOfMonths = durationMatch[1];
          }
        }
        // Get default taxRate from first available instrument or use 0 as fallback
        const defaultTaxRate = availableInstruments.length > 0 ? availableInstruments[0].taxRate : 0;
        return [
          {
            id: Date.now().toString(),
            instrumentId: 0,
            instrumentCode: "",
            instrument: "",
            retailValue: "",
            assetTag: "",
            monthlyRate: "0",
            numberOfMonths: numberOfMonths,
            total: "0.00",
            taxRate: defaultTaxRate,
          },
        ];
      }
      return filtered;
    });
  };

  const handleSave = async () => {
    if (!formData.studentId) {
      toast.error("Please select a student");
      return;
    }

    const filledInstruments = instruments.filter(
      (inst) => inst.instrumentId > 0
    );

    if (filledInstruments.length === 0) {
      toast.error("Please add at least one instrument");
      return;
    }

    const hasEmptyMonths = filledInstruments.some(
      (inst) => !inst.numberOfMonths || inst.numberOfMonths === "0"
    );
    if (hasEmptyMonths) {
      toast.error("Please fill in the number of months for all instruments");
      return;
    }

    if (!formData.rentalStartDate) {
      toast.error("Please select a rental start date");
      return;
    }

    try {
      setSaving(true);

      const durationMatch = formData.duration.match(/^(\d+)/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 1;

      const tenderTypeNumber =
        TENDER_TYPE_MAP[formData.tenderType] || formData.tenderType || "";

      const startDateFormatted = format(
        formData.rentalStartDate,
        "MMM dd, yyyy"
      );

      let returnDateISO = "";
      if (formData.returnDate) {
        returnDateISO = formData.returnDate.toISOString();
      } else if (!formData.onGoing && formData.rentalStartDate) {
        const calculatedReturnDate = calculateReturnDate(
          formData.rentalStartDate,
          duration
        );
        returnDateISO = calculatedReturnDate.toISOString();
      }

      const mappedInstruments = filledInstruments.map((instrument) => ({
        instrumentId: instrument.instrumentId,
        retailValue: instrument.retailValue || "",
        assetTag: instrument.assetTag || "",
        monthlyRate: instrument.monthlyRate || "0",
        numberOfMonths: instrument.numberOfMonths || "0",
        total: instrument.total || "0.00",
      }));

      const subTotal = filledInstruments.reduce(
        (sum, instrument) => sum + parseFloat(instrument.total || "0"),
        0
      );
      // Calculate HST using taxRate from each instrument (weighted average)
      let totalTax = 0;
      filledInstruments.forEach((instrument) => {
        const instrumentTotal = parseFloat(instrument.total || "0");
        totalTax += (instrumentTotal * instrument.taxRate) / 100;
      });
      const hst = totalTax;
      const instrumentsTotal = subTotal + hst;

      const response = await createEquipmentRental(location, customerId, {
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
      });

      if (response.status) {
        toast.success("Equipment rental created successfully");

        const selectedStudent = availableStudents.find(
          (s) => s.id.toString() === formData.studentId
        );

        setCreatedRentalData({
          customerName: formData.customer,
          customerAddress: formData.address,
          customerCity: formData.city,
          customerPostalCode: formData.postalCode,
          homePhone: formData.homePhone,
          workPhone: formData.workPhone,
          otherPhone: formData.otherPhone,
          email: formData.email,
          studentFirstName: selectedStudent?.fullName.split(" ")[0] || "",
          studentLastName:
            selectedStudent?.fullName.split(" ").slice(1).join(" ") || "",
          startDate: format(formData.rentalStartDate, "yyyy-MM-dd"),
          duration: duration,
          returnDate: returnDateISO
            ? format(new Date(returnDateISO), "yyyy-MM-dd")
            : "",
          instruments: filledInstruments,
          subTotal: subTotal,
          hst: hst,
          total: instrumentsTotal,
          location: location,
        });

        setShowReceiptModal(true);

        if (onSave) {
          onSave({
            ...formData,
            instruments: filledInstruments,
          });
        }
      } else {
        const errorMessage =
          response.errors?.join(", ") || "Failed to create equipment rental";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create equipment rental";
      toast.error(errorMessage);
      console.error("Error creating equipment rental:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReprintAgreement = () => {
    if (!rentalId) return;

    const filledInstruments = instruments.filter(
      (inst) => inst.instrumentId > 0
    );
    const subTotal = filledInstruments.reduce(
      (sum, instrument) => sum + parseFloat(instrument.total || "0"),
      0
    );
    // Calculate HST using taxRate from each instrument (weighted average)
    let totalTax = 0;
    filledInstruments.forEach((instrument) => {
      const instrumentTotal = parseFloat(instrument.total || "0");
      totalTax += (instrumentTotal * instrument.taxRate) / 100;
    });
    const hst = totalTax;
    const instrumentsTotal = subTotal + hst;

    const legacyBaseUrl =
      process.env.NEXT_PUBLIC_LEGACY_URL ||
      "https://dev2.studiomanagerweb.com/admin";
    const params = new URLSearchParams({
      subTotal: subTotal.toFixed(2),
      hst: hst.toFixed(2),
      instutmentsTotal: instrumentsTotal.toFixed(2),
    });
    const url = `${legacyBaseUrl}/${location}/print/rental-receipt?${params.toString()}`;

    window.open(url, "_blank");

    if (onReprintAgreement) {
      onReprintAgreement(rentalId);
    }
  };

  const handleEquipmentReturned = async () => {
    if (!rentalId) return;

    try {
      setReturning(true);

      const selectedStudent = availableStudents.find(
        (s) => s.id.toString() === formData.studentId
      );
      const studentName = selectedStudent?.fullName || "";

      if (!studentName) {
        toast.error("Student information not found");
        return;
      }

      // Use the actual return date from formData if available, otherwise use today's date
      // For ongoing rentals, if user has set a return date via Edit button, use that
      // Otherwise, use today's date as the equipment returned date
      const equipmentReturnedDate = formData.returnDate && formData.returnDate instanceof Date
        ? formData.returnDate
        : new Date();
      const returnDateFormatted = format(equipmentReturnedDate, "MMM dd, yyyy");
      
      // NOTE: We do NOT send returnDate in FormData to preserve the original return date
      // The backend should preserve the original return date from the database
      // Only the URL parameter 'returnDate' is used to set the equipment returned date

      const filledInstruments = instruments.filter(
        (inst) => inst.instrumentId > 0
      );

      const mappedInstruments =
        filledInstruments.length > 0
          ? filledInstruments.map((instrument) => {
              const instrumentTotal = parseFloat(instrument.total || "0");
              // Use taxRate from each instrument instead of hardcoded TAX_RATE
              const instrumentTax = ((instrumentTotal * instrument.taxRate) / 100).toFixed(2);
              return {
                value: "",
                asset: "",
                price: instrument.monthlyRate || "0",
                duration: instrument.numberOfMonths || "0",
                total: instrument.total || "0.00",
                tax: instrumentTax,
              };
            })
          : [
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
        returnDateFormatted, // This sets the equipment returned date (uses formData.returnDate if set, otherwise today's date)
        {
          userId: customerId,
          customerName: formData.customer,
          studentName: studentName,
          // returnDate is NOT sent in FormData to preserve the original return date
          securityDeposit: "",
          tenderType: "",
          depositAmount: "0.00",
          instruments: mappedInstruments,
        }
      );

      if (response.status) {
        toast.success("Equipment marked as returned successfully");
        onOpenChange(false);
        if (onEquipmentReturned) {
          onEquipmentReturned(rentalId);
        }
      } else {
        const errorMessage =
          response.errors?.join(", ") || "Failed to mark equipment as returned";
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

  const handleUpdateReturnDate = async () => {
    if (!formData.returnDate || !rentalId) {
      toast.error("Please select a return date");
      return;
    }

    // Validate minimum 30 days from start date (matching backend validation)
    if (formData.rentalStartDate) {
      const minimumDate = getMinimumReturnDate(formData.rentalStartDate);
      const selectedDate = normalizeDate(formData.returnDate);
      
      if (selectedDate < minimumDate) {
        toast.error("Minimum duration should be 30 days from the start date.");
        return;
      }
    }

    try {
      setUpdating(true);

      const selectedStudent = availableStudents.find(
        (s) => s.id.toString() === formData.studentId
      );
      const studentName = selectedStudent?.fullName || "";

      if (!studentName) {
        toast.error("Student information not found");
        return;
      }

      const returnDateFormatted = format(formData.returnDate, "MMM dd, yyyy");

      const filledInstruments = instruments.filter(
        (inst) => inst.instrumentId > 0
      );

      const mappedInstruments =
        filledInstruments.length > 0
          ? filledInstruments.map((instrument) => {
              const instrumentTotal = parseFloat(instrument.total || "0");
              // Use taxRate from each instrument instead of hardcoded TAX_RATE
              const instrumentTax = ((instrumentTotal * instrument.taxRate) / 100).toFixed(2);
              return {
                value: "",
                asset: "",
                price: instrument.monthlyRate || "0",
                duration: "", // Empty string as per API requirement
                total: instrument.total || "0.00",
                tax: instrumentTax,
              };
            })
          : [
              {
                value: "",
                asset: "",
                price: "0",
                duration: "",
                total: "0.00",
                tax: "0.00",
              },
            ];

      const response = await updateEquipmentRental(
        location,
        rentalId,
        returnDateFormatted,
        {
          userId: customerId,
          customerName: formData.customer,
          studentName: studentName,
          returnDate: returnDateFormatted,
          securityDeposit: "",
          tenderType: "",
          depositAmount: formData.depositAmount || "0.00",
          instruments: mappedInstruments,
        }
      );

      if (response.status) {
        toast.success("Return date updated successfully");
        // Refresh the data to get updated return date
        await fetchEquipmentRentalsData();
        if (onSave) {
          onSave({
            ...formData,
            instruments: filledInstruments,
          });
        }
      } else {
        // Handle both string and array error formats
        let errorMessage = "Failed to update return date";
        if (response.errors) {
          if (typeof response.errors === "string") {
            errorMessage = response.errors;
          } else if (Array.isArray(response.errors)) {
            errorMessage = response.errors.join(", ");
          }
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update return date";
      toast.error(errorMessage);
      console.error("Error updating return date:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    if (!rentalId) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!rentalId) return;

    try {
      setDeleting(true);
      setShowDeleteConfirm(false);

      const selectedStudent = availableStudents.find(
        (s) => s.id.toString() === formData.studentId
      );
      const studentName = selectedStudent?.fullName || "";

      if (!studentName) {
        toast.error("Student information not found");
        return;
      }

      const returnDateISO = formData.returnDate
        ? format(formData.returnDate, "yyyy-MM-dd")
        : "";

      const filledInstruments = instruments.filter(
        (inst) => inst.instrumentId > 0
      );

      const mappedInstruments =
        filledInstruments.length > 0
          ? filledInstruments.map((instrument) => {
              const instrumentTotal = parseFloat(instrument.total || "0");
              // Use taxRate from each instrument instead of hardcoded TAX_RATE
              const instrumentTax = ((instrumentTotal * instrument.taxRate) / 100).toFixed(2);
              return {
                value: "",
                asset: "",
                price: instrument.monthlyRate || "0",
                duration: instrument.numberOfMonths || "0",
                total: instrument.total || "0.00",
                tax: instrumentTax,
              };
            })
          : [
              {
                value: "",
                asset: "",
                price: "0",
                duration: "0",
                total: "0.00",
                tax: "0.00",
              },
            ];

      const response = await deleteEquipmentRental(location, rentalId, {
        userId: customerId,
        customerName: formData.customer,
        studentName: studentName,
        returnDate: returnDateISO,
        securityDeposit: "",
        tenderType: "",
        depositAmount: formData.depositAmount || "0.00",
        instruments: mappedInstruments,
      });

      if (response.status) {
        toast.success("Equipment rental deleted successfully");
        onOpenChange(false);
        if (onDelete) {
          onDelete();
        }
      } else {
        const errorMessage =
          response.errors?.join(", ") || "Failed to delete equipment rental";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete equipment rental";
      toast.error(errorMessage);
      console.error("Error deleting equipment rental:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    setCreatedRentalData(null);
    onOpenChange(false);
  };

  const handlePrintReceipt = () => {
    if (!createdRentalData) return;

    const legacyBaseUrl =
      process.env.NEXT_PUBLIC_LEGACY_URL ||
      "https://dev2.studiomanagerweb.com/admin";
    const params = new URLSearchParams({
      subTotal: createdRentalData.subTotal.toFixed(2),
      hst: createdRentalData.hst.toFixed(2),
      instutmentsTotal: createdRentalData.total.toFixed(2),
    });
    const url = `${legacyBaseUrl}/${location}/print/rental-receipt?${params.toString()}`;
    window.open(url, "_blank");
  };

  const generateEmailContent = useCallback(() => {
    if (!createdRentalData) return { subject: "", content: "" };

    const {
      customerName,
      customerAddress,
      customerCity,
      customerPostalCode,
      homePhone,
      workPhone,
      otherPhone,
      email,
      studentFirstName,
      studentLastName,
      startDate,
      duration,
      returnDate,
      instruments,
      subTotal,
      hst,
      total,
      location,
    } = createdRentalData;

    const subject = "Receipt from Arcadia Academy of Music";
    
    // Calculate total retail value
    const totalRetailValue = instruments.reduce(
      (sum, inst) => sum + parseFloat(inst.retailValue || "0"),
      0
    );

    // Get the first instrument's monthly rate (or use first available)
    const firstInstrumentRate = instruments[0]?.monthlyRate || "0.00";

    // Format dates
    const formattedStartDate = format(new Date(startDate), "MMM dd, yyyy");
    const formattedReturnDate = returnDate
      ? format(new Date(returnDate), "MMM dd, yyyy")
      : null;

    // Get base URL for images (use window.location.origin or fallback)
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || '';

    // Generate instrument table rows - matching receipt modal exactly: p-3 text-sm
    const instrumentRows = instruments
      .map(
        (inst) => `
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; color: #111827; vertical-align: middle;">${inst.instrument}</td>
          <td style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; color: #111827; vertical-align: middle;">$${inst.retailValue || "0.00"}</td>
          <td style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; color: #111827; vertical-align: middle;">${inst.assetTag || "N/A"}</td>
          <td style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; color: #111827; vertical-align: middle;">$${inst.monthlyRate}</td>
          <td style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; color: #111827; vertical-align: middle;">${inst.numberOfMonths}</td>
          <td style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; font-weight: 500; color: #111827; vertical-align: middle;">$${inst.total}</td>
        </tr>
      `
      )
      .join("");

    const content = `
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 100%; border-collapse: collapse; background-color: #ffffff;">
        <tr>
          <td style="padding: 32px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #111827; text-align: left;">
            <!-- Header - Using table for email compatibility -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #dc2626; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top; padding-right: 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="vertical-align: middle; padding-right: 16px; width: 80px; height: 80px; line-height: 0;">
                        <img src="${baseUrl}/admin/v2/SMW.png" alt="Musical Instruments Logo" width="80" height="80" style="width: 80px; height: 80px; max-width: 80px; max-height: 80px; display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
                      </td>
                      <td style="vertical-align: middle;">
                        <h2 style="font-size: 30px; font-weight: bold; color: #1f2937; margin: 0; line-height: 1.2; padding: 0; text-align: left;">Musical Instruments</h2>
                        <p style="font-size: 16px; font-weight: 600; color: #6b7280; margin: 4px 0 0 0; padding: 0; text-align: left;">Rental Program</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="vertical-align: top; text-align: left; font-size: 14px; color: #6b7280;">
                  <p style="font-weight: 500; margin: 0; padding: 0; text-align: left;">205 Marycroft Ave., Unit 6</p>
                  <p style="font-weight: 500; margin: 4px 0; padding: 0; text-align: left;">${location}, Ontario</p>
                  <p style="font-weight: 500; margin: 4px 0; padding: 0; text-align: left;">Tel: (905) 254-3424</p>
                </td>
              </tr>
            </table>

        <!-- Rental Program Details - Using table for email compatibility -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 32px; background-color: #f9fafb; border-radius: 8px; border-collapse: separate; border-spacing: 0;">
          <tr>
            <td style="padding: 16px 8px 16px 16px; vertical-align: top; text-align: left;">
              <p style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 4px 0; text-align: left;">Start Date</p>
              <p style="font-size: 16px; font-weight: 500; color: #111827; margin: 0; text-align: left;">${formattedStartDate}</p>
            </td>
            <td style="padding: 16px 8px; vertical-align: top; text-align: left;">
              <p style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 4px 0; text-align: left;">Duration</p>
              <p style="font-size: 16px; font-weight: 500; color: #111827; margin: 0; text-align: left;">${duration} Month${duration > 1 ? "s" : ""}</p>
            </td>
            <td style="padding: 16px 16px 16px 8px; vertical-align: top; text-align: left;">
              <p style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin: 0 0 4px 0; text-align: left;">Return Date</p>
              <p style="font-size: 16px; font-weight: 500; color: #111827; margin: 0; text-align: left;">${formattedReturnDate || "On Going"}</p>
            </td>
          </tr>
        </table>

        <!-- Customer Information - Matching receipt modal: mb-8 -->
        <div style="margin-bottom: 32px; text-align: left;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; text-align: left;">Customer Information</h3>
          <p style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #111827; text-align: left;">
            Parent/Guardian: <span style="font-weight: normal;">${customerName}</span>
          </p>

          <!-- Student section - Using table for email compatibility -->
          <div style="margin-bottom: 16px; text-align: left;">
            <p style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; text-align: left;">Student</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f9fafb; border-radius: 4px; border-collapse: separate; border-spacing: 0;">
              <tr>
                <td style="padding: 12px 8px 12px 12px; vertical-align: top; width: 50%; text-align: left;">
                  <p style="font-size: 12px; font-weight: 600; color: #6b7280; margin: 0 0 4px 0; text-align: left;">First Name:</p>
                  <p style="font-size: 16px; color: #111827; margin: 0; text-align: left;">${studentFirstName}</p>
                </td>
                <td style="padding: 12px 12px 12px 8px; vertical-align: top; width: 50%; text-align: left;">
                  <p style="font-size: 12px; font-weight: 600; color: #6b7280; margin: 0 0 4px 0; text-align: left;">Last Name:</p>
                  <p style="font-size: 16px; color: #111827; margin: 0; text-align: left;">${studentLastName}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Address grid - Using table for email compatibility -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 12px; border-collapse: separate; border-spacing: 0;">
            <tr>
              <td style="padding: 0 8px 0 0; vertical-align: top; width: 33.33%; text-align: left;">
                <p style="font-size: 12px; font-weight: 600; color: #6b7280; margin: 0 0 4px 0; text-align: left;">Address:</p>
                <p style="font-size: 14px; color: #111827; margin: 0; text-align: left;">${customerAddress}</p>
              </td>
              <td style="padding: 0 8px; vertical-align: top; width: 33.33%; text-align: left;">
                <p style="font-size: 12px; font-weight: 600; color: #6b7280; margin: 0 0 4px 0; text-align: left;">City:</p>
                <p style="font-size: 14px; color: #111827; margin: 0; text-align: left;">${customerCity}</p>
              </td>
              <td style="padding: 0 0 0 8px; vertical-align: top; width: 33.33%; text-align: left;">
                <p style="font-size: 12px; font-weight: 600; color: #6b7280; margin: 0 0 4px 0; text-align: left;">Postal Code:</p>
                <p style="font-size: 14px; color: #111827; margin: 0; text-align: left;">${customerPostalCode}</p>
              </td>
            </tr>
          </table>

          <!-- Phone grid - Using table for email compatibility -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 12px; border-collapse: separate; border-spacing: 0;">
            <tr>
              <td style="padding: 0 8px 0 0; vertical-align: top; width: 33.33%; text-align: left;">
                <p style="font-size: 12px; font-weight: 600; color: #6b7280; margin: 0 0 4px 0; text-align: left;">Home Phone:</p>
                <p style="font-size: 14px; color: #111827; margin: 0; text-align: left;">${homePhone || ""}</p>
              </td>
              <td style="padding: 0 8px; vertical-align: top; width: 33.33%; text-align: left;">
                <p style="font-size: 12px; font-weight: 600; color: #6b7280; margin: 0 0 4px 0; text-align: left;">Work Phone:</p>
                <p style="font-size: 14px; color: #111827; margin: 0; text-align: left;">${workPhone || ""}</p>
              </td>
              <td style="padding: 0 0 0 8px; vertical-align: top; width: 33.33%; text-align: left;">
                <p style="font-size: 12px; font-weight: 600; color: #6b7280; margin: 0 0 4px 0; text-align: left;">Other Phone:</p>
                <p style="font-size: 14px; color: #111827; margin: 0; text-align: left;">${otherPhone || ""}</p>
              </td>
            </tr>
          </table>

          <!-- Email -->
          <div style="text-align: left;">
            <p style="font-size: 12px; font-weight: 600; color: #6b7280; margin: 0 0 4px 0; text-align: left;">Email:</p>
            <p style="font-size: 14px; color: #111827; margin: 0; text-align: left;">${email}</p>
          </div>
        </div>

        <!-- Instrument Details - Matching receipt modal: mb-8 -->
        <div style="margin-bottom: 32px; text-align: left;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 0 0 12px 0; text-align: left;">Instrument Details</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #111827;">Instrument</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #111827;">Retail Value</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #111827;">Asset Tag/Serial#</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #111827;">Monthly Rate</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #111827;"># of Months</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #111827;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${instrumentRows}
            </tbody>
          </table>
        </div>

        <!-- Summary of Charges - Using table for email compatibility -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 32px;">
          <tr>
            <td style="text-align: right;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 320px; background-color: #f9fafb; border-radius: 8px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="font-weight: 600; color: #374151; padding-bottom: 8px;">Sub Total:</td>
                        <td style="text-align: right; font-weight: 500; color: #111827; padding-bottom: 8px;">$${subTotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #374151; padding-bottom: 8px;">HST (13%):</td>
                        <td style="text-align: right; font-weight: 500; color: #111827; padding-bottom: 8px;">$${hst.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top: 2px solid #d1d5db; padding-top: 12px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="font-weight: bold; font-size: 18px; color: #1f2937;">Total:</td>
                              <td style="text-align: right; font-weight: bold; font-size: 18px; color: #1f2937;">$${total.toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Rental Agreement - Matching receipt modal: border-t-2 pt-6 -->
        <div style="border-top: 2px solid #d1d5db; padding-top: 24px; text-align: left;">
          <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 12px; color: #1f2937; text-align: left;">Rental Agreement:</h3>
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; text-align: left;">
            <p style="font-size: 14px; text-align: left; line-height: 1.75; color: #374151; margin: 0;">
              I HAVE RECEIVED FROM ARCADIA ACADEMY OF MUSIC THE ABOVE LISTED ITEMS WHICH I HAVE EXAMINED AND FIND TO BE IN GOOD WORKING CONDITION. THE VALUE OF WHICH IS $${totalRetailValue.toFixed(2)}. I AM RENTING THIS FOR A PERIOD OF ${duration} MONTH${duration > 1 ? "S" : ""} AT THE RATE OF $${firstInstrumentRate} (excl. taxes) PER MONTH. OVERDUE RENT WILL BE DEDUCTED FROM THE DEPOSIT AT THE PRO RATA DAILY RATE. I, <strong>${customerName}</strong>, WILL BE RESPONSIBLE FOR THE VALUE OF THE ITEMS, IF FOR ANY REASON THEY ARE NOT RETURNED TO ARCADIA ACADEMY OF MUSIC. I, <strong>${customerName}</strong>, WILL ALSO BE RESPONSIBLE FOR ANY DAMAGE TO THESE ITEMS BEYOND NORMAL EXPECTED WEAR. I, <strong>${customerName}</strong>, WILL PAY ANY FEES OR COSTS TO THE OWNER IN REPOSSESSING THE ITEMS OR COLLECTING THE RENTALS DUE. AN ADDITIONAL CHARGE OF $5.00 WILL BE ADDED TO ALL RENTALS RETURNED AFTER THE DUE DATE.
            </p>
          </div>

          <!-- Two clauses - Using table for email compatibility -->
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #d1d5db;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px; border-collapse: separate; border-spacing: 0;">
              <tr>
                <td style="padding: 0 8px 0 0; vertical-align: top; width: 50%;">
                  <div style="border: 2px dashed #9ca3af; padding: 16px; border-radius: 4px;">
                    <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0; text-align: center;">RENTAL EQUIPMENT IS NOT COVERED BY ARCADIA ACADEMY OF MUSIC INSURANCE</p>
                  </div>
                </td>
                <td style="padding: 0 0 0 8px; vertical-align: top; width: 50%;">
                  <div style="border: 2px dashed #9ca3af; padding: 16px; border-radius: 4px;">
                    <p style="font-size: 14px; font-weight: 600; color: #374151; margin: 0; text-align: center;">RENTAL PAYMENTS DO NOT APPLY TO PURCHASE</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>
          </td>
        </tr>
      </table>
    `;

    return { subject, content };
  }, [createdRentalData]);

  const handleEmail = () => {
    if (!createdRentalData) return;

    // Generate email content and pass to EmailStatementModal via onEmail
    // NOTE: This only opens the email modal - NO API call is made here
    const { subject, content } = generateEmailContent();
    
    // Close receipt modal to prevent dark overlay stacking
    setShowReceiptModal(false);
    
    if (onEmail) {
      // Open EmailStatementModal with pre-filled content (no API call)
      onEmail({
        subject,
        content,
      });
    }
  };

  const filledInstruments = instruments.filter((inst) => inst.instrumentId > 0);
  
  let subtotal = 0;
  let taxTotal = 0;

  filledInstruments.forEach((inst) => {
    const instrumentTotal = parseFloat(inst.total || "0");
    subtotal += instrumentTotal;
    // Use taxRate from each instrument instead of hardcoded TAX_RATE
    taxTotal += (instrumentTotal * inst.taxRate) / 100;
  });

  const subTotal = subtotal;
  const tax = taxTotal;
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
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>

              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-10 w-48" />
              </div>

              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>

              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>

              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
              </div>

              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-20 ml-6" />
              </div>

              <div className="flex items-center p-5 gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-24 ml-6" />
                <Skeleton className="h-10 w-48" />
              </div>

              <div className="flex items-start p-5 gap-4">
                <Skeleton className="h-6 w-48" />
                <div className="flex flex-col space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>

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
                className="w-48"
                readOnly={true}
                disabled={true}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-24">Address</Label>
              <Input
                value={formData.address}
                className="w-48"
                readOnly={true}
                disabled={true}
              />
              <Label className="w-16">City</Label>
              <Input
                value={formData.city}
                className="w-48"
                readOnly={true}
                disabled={true}
              />
              <Label className="w-8">P.C</Label>
              <Input
                value={formData.postalCode}
                className="w-48"
                readOnly={true}
                disabled={true}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-24">Home Phone</Label>
              <Input
                value={formData.homePhone}
                className="w-48"
                readOnly={true}
                disabled={true}
              />
              <Label className="w-24">Work Phone</Label>
              <Input
                value={formData.workPhone}
                className="w-48"
                readOnly={true}
                disabled={true}
              />
              <Label className="w-24">Other Phone</Label>
              <Input
                value={formData.otherPhone}
                className="w-48"
                readOnly={true}
                disabled={true}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-24">Email</Label>
              <Input
                value={formData.email}
                className="w-48"
                readOnly={true}
                disabled={true}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-24">Student</Label>
              <Select
                value={formData.studentId || undefined}
                onValueChange={(value) => handleInputChange("studentId", value)}
                disabled={isEditMode}
              >
                <SelectTrigger className="w-48">
                  <SelectValue
                    placeholder={isEditMode ? "Select Student" : "Student"}
                  />
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
              <Popover
                open={isStartDateOpen && !isEditMode}
                onOpenChange={setIsStartDateOpen}
              >
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
                  onCheckedChange={(checked) => {
                    // Ensure we convert to boolean (handles true/false/undefined/"indeterminate")
                    const isChecked = checked === true;
                    // Immediately update state to clear return date when checking "On Going"
                    if (isChecked) {
                      // Use flushSync to force synchronous updates so Input clears immediately
                      // Set everything in a single state update to ensure consistency
                      flushSync(() => {
                        setFormData((prev) => ({
                          ...prev,
                          onGoing: true,
                          returnDate: undefined, // Explicitly clear returnDate
                          duration: "", // Explicitly clear duration
                        }));
                      });
                      // Set numberOfMonths to "1" for all instruments when "On Going" is checked
                      flushSync(() => {
                        setInstruments((prevInstruments) =>
                          prevInstruments.map((inst) => ({
                            ...inst,
                            numberOfMonths: "1", // Set to 1 month for ongoing rentals
                          }))
                        );
                      });
                      // Update instruments after state is set
                      const startDate = formData.rentalStartDate instanceof Date 
                        ? formData.rentalStartDate 
                        : new Date();
                      updateInstrumentsForOngoing(startDate);
                    } else {
                      handleInputChange("onGoing", false);
                    }
                  }}
                  disabled={isEditMode}
                />
                <Label htmlFor="onGoing">On Going</Label>
              </div>
            </div>

            <div className="flex items-center p-5 gap-4">
              <Label className="w-24">Duration</Label>
              <Select
                key={`duration-${formData.onGoing ? "ongoing" : formData.duration || "empty"}`}
                value={
                  // Always show placeholder (undefined) when "On Going" is checked
                  formData.onGoing 
                    ? undefined 
                    : formData.duration && formData.duration !== "" 
                      ? formData.duration 
                      : undefined
                }
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
              {isEditMode && formData.onGoing ? (
                // In edit mode with ongoing rental, show date picker to allow setting return date
                <Popover
                  open={isReturnDateOpen}
                  onOpenChange={setIsReturnDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-48 justify-start text-left font-normal",
                        !formData.returnDate && "text-muted-foreground"
                      )}
                    >
                      <CalIcon className="mr-2 h-4 w-4" />
                      {formData.returnDate
                        ? format(formData.returnDate, "MMM dd, yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.returnDate}
                      onSelect={(date) => {
                        if (date) {
                          // Validate minimum 30 days from start date
                          if (formData.rentalStartDate) {
                            const minimumDate = getMinimumReturnDate(formData.rentalStartDate);
                            const selectedDate = normalizeDate(date);
                            
                            if (selectedDate < minimumDate) {
                              toast.error("Minimum duration should be 30 days from the start date.");
                              setIsReturnDateOpen(false);
                              return;
                            }
                          }
                          handleInputChange("returnDate", date);
                        } else {
                          // Clear return date
                          setFormData((prev) => ({
                            ...prev,
                            returnDate: undefined,
                          }));
                        }
                        setIsReturnDateOpen(false);
                      }}
                      disabled={(date) => {
                        // Disable dates that are less than 30 days from start date
                        if (!formData.rentalStartDate) {
                          return false;
                        }
                        const minimumDate = getMinimumReturnDate(formData.rentalStartDate);
                        const checkDate = normalizeDate(date);
                        return checkDate < minimumDate;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                // In create mode or non-ongoing, show read-only input
                <Input
                  key={`return-date-${formData.onGoing ? "ongoing-empty" : formData.returnDate?.toISOString() || "empty"}-${formData.returnDate === undefined ? "undefined" : "defined"}`}
                  value={
                    // Direct inline check - MUST be empty when onGoing is true
                    formData.onGoing === true
                      ? ""
                      : returnDateInputValue
                  }
                  readOnly
                  disabled={formData.onGoing || isEditMode}
                  className="bg-gray-50 dark:bg-gray-800 w-48"
                  placeholder=""
                />
              )}
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
                className={`flex flex-col space-y-2 ${
                  isEditMode ? "opacity-60 pointer-events-none" : ""
                }`}
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
                      <SelectItem value="Select Tender Type">
                        Select Tender Type
                      </SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="preauthorized">
                        Preauthorized
                      </SelectItem>
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
                  {!isEditMode &&
                    instruments.map((instrument) => (
                      <InstrumentFormRow
                        key={instrument.id}
                        instrument={instrument}
                        onInstrumentChange={handleInstrumentChange}
                        onInputFocus={handleInputFocus}
                        onInputBlur={handleInputBlur}
                        availableInstruments={availableInstruments}
                        onDelete={() => handleDeleteInstrument(instrument.id)}
                        showDelete={instruments.length > 1}
                      />
                    ))}
                  {isEditMode &&
                    instruments.length > 0 &&
                    instruments.map((instrument) => (
                      <tr
                        key={instrument.id}
                        className="border-b dark:border-gray-700"
                      >
                        <td className="p-3 font-medium">
                          {instrument.instrument || "N/A"}
                        </td>
                        <td className="p-3 text-right">
                          {instrument.retailValue || "0.00"}
                        </td>
                        <td className="p-3">{instrument.assetTag || ""}</td>
                        <td className="p-3 text-right">
                          {instrument.monthlyRate || "0.00"}
                        </td>
                        <td className="p-3 text-right">
                          {instrument.numberOfMonths || "1"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">
                              {instrument.total || "0.00"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {isEditMode && instruments.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-3 text-center text-muted-foreground"
                      >
                        No instruments found for this rental
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!isEditMode && (
              <div className="mt-4">
                <Button onClick={handleAddAnotherInstrument} className="w-fit">
                  Add Instrument
                </Button>
              </div>
            )}
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

        <DialogFooter
          className={`w-full flex gap-2 p-6 pt-4 border-t dark:border-gray-700 bg-background ${
            isEditMode ? "justify-between sm:justify-between" : "justify-end"
          }`}
        >
          {isEditMode && (
            <div className="flex items-center gap-2">
              {rentalCreatedOn &&
                (() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const createdDate = new Date(rentalCreatedOn);
                  createdDate.setHours(0, 0, 0, 0);
                  const showDelete = today <= createdDate;
                  return showDelete ? (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteClick}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  ) : null;
                })()}
              <Button onClick={handleReprintAgreement}>
                Reprint Agreement
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            {isEditMode && formData.onGoing && (
              <Button
                onClick={handleUpdateReturnDate}
                disabled={!formData.returnDate || updating}
              >
                {updating ? "Updating..." : "Edit"}
              </Button>
            )}
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
            {isEditMode ? (
              (() => {
                const durationMatch = formData.duration.match(/^(\d+)-month/i);
                const durationMonths = durationMatch ? parseInt(durationMatch[1]) : 0;
                
                // Check if ongoing rental with return date >= 2 months from start date
                const isOngoingWithReturnDateAtLeastTwoMonths = (() => {
                  if (!formData.onGoing || !formData.returnDate || !formData.rentalStartDate) {
                    return false;
                  }
                  
                  // Ensure dates are Date objects
                  if (!(formData.rentalStartDate instanceof Date) || !(formData.returnDate instanceof Date)) {
                    return false;
                  }
                  
                  const startDate = normalizeDate(formData.rentalStartDate);
                  const returnDate = normalizeDate(formData.returnDate);
                  
                  // Check if return date is in the future from start date
                  if (returnDate < startDate) {
                    return false; // Return date cannot be before start date
                  }
                  
                  // Calculate months difference
                  // differenceInMonths returns the number of full months between dates
                  const monthsDifference = differenceInMonths(returnDate, startDate);
                  
                  // Enable ONLY if return date is >= 2 months from start date
                  // For example: 
                  // - Nov 17 to Nov 21 = 0 months (disabled) ✓
                  // - Nov 17 to Dec 17 = 1 month (disabled) ✓
                  // - Nov 17 to Jan 17 = 2 months (enabled) ✓
                  // - Nov 17 to Feb 17 = 3 months (enabled) ✓
                  return monthsDifference >= 2;
                })();
                
                // Check if return date has been reached (for non-ongoing rentals)
                const hasReachedReturnDate = (() => {
                  if (!formData.returnDate) return false;
                  const today = normalizeDate(new Date());
                  const returnDate = normalizeDate(formData.returnDate);
                  return today >= returnDate;
                })();
                
                // Determine if button should be enabled
                let isEnabled: boolean;
                if (formData.onGoing && formData.returnDate) {
                  // For ongoing rentals with return date, only enable if return date >= 2 months
                  isEnabled = isOngoingWithReturnDateAtLeastTwoMonths;
                } else {
                  // For non-ongoing rentals, enable if duration >= 2 months OR return date has been reached
                  isEnabled = durationMonths >= 2 || hasReachedReturnDate;
                }

                return (
                  <Button
                    onClick={handleEquipmentReturned}
                    disabled={returning || !isEnabled}
                  >
                    {returning ? "Processing..." : "Equipment Returned"}
                  </Button>
                );
              })()
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Creating..." : "Create"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equipment Rental</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this equipment rental? This action
              cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal - keeping it as is from original */}
      <Dialog open={showReceiptModal} onOpenChange={handleCloseReceiptModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Equipment Rental Receipt
            </DialogTitle>
          </DialogHeader>

          {createdRentalData && (
            <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
              <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-red-600">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex items-center justify-center relative">
                    <Image
                      src="/admin/v2/SMW.png"
                      alt="Musical Instruments Logo"
                      width={80}
                      height={80}
                      className="object-contain dark:hidden"
                      priority
                    />
                    <Image
                      src="/admin/v2/SMW-dark.png"
                      alt="Musical Instruments Logo"
                      width={80}
                      height={80}
                      className="object-contain hidden dark:block"
                      priority
                    />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                      Musical Instruments
                    </h2>
                    <p className="text-base font-semibold text-gray-600 dark:text-gray-300">
                      Rental Program
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600 dark:text-gray-300">
                  <p className="font-medium">205 Marycroft Ave., Unit 6</p>
                  <p className="font-medium">
                    {createdRentalData.location}, Ontario
                  </p>
                  <p className="font-medium">Tel: (905) 254-3424</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Start Date
                  </p>
                  <p className="text-base font-medium dark:text-gray-100">
                    {format(
                      new Date(createdRentalData.startDate),
                      "MMM dd, yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Duration
                  </p>
                  <p className="text-base font-medium dark:text-gray-100">
                    {createdRentalData.duration} Month
                    {createdRentalData.duration > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Return Date
                  </p>
                  <p className="text-base font-medium dark:text-gray-100">
                    {createdRentalData.returnDate
                      ? format(
                          new Date(createdRentalData.returnDate),
                          "MMM dd, yyyy"
                        )
                      : "On Going"}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2">
                  Customer Information
                </h3>
                <p className="text-base font-semibold mb-4 dark:text-gray-100">
                  Parent/Guardian:{" "}
                  <span className="font-normal">
                    {createdRentalData.customerName}
                  </span>
                </p>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Student
                  </p>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        First Name:
                      </p>
                      <p className="text-base dark:text-gray-100">
                        {createdRentalData.studentFirstName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Last Name:
                      </p>
                      <p className="text-base dark:text-gray-100">
                        {createdRentalData.studentLastName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Address:
                    </p>
                    <p className="text-sm dark:text-gray-100">
                      {createdRentalData.customerAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      City:
                    </p>
                    <p className="text-sm dark:text-gray-100">
                      {createdRentalData.customerCity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Postal Code:
                    </p>
                    <p className="text-sm dark:text-gray-100">
                      {createdRentalData.customerPostalCode}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Home Phone:
                    </p>
                    <p className="text-sm dark:text-gray-100">
                      {createdRentalData.homePhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Work Phone:
                    </p>
                    <p className="text-sm dark:text-gray-100">
                      {createdRentalData.workPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Other Phone:
                    </p>
                    <p className="text-sm dark:text-gray-100">
                      {createdRentalData.otherPhone}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Email:
                  </p>
                  <p className="text-sm dark:text-gray-100">
                    {createdRentalData.email}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                  Instrument Details
                </h3>
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="border border-gray-300 dark:border-gray-700 p-3 text-left text-sm font-semibold dark:text-gray-100">
                        Instrument
                      </th>
                      <th className="border border-gray-300 dark:border-gray-700 p-3 text-left text-sm font-semibold dark:text-gray-100">
                        Retail Value
                      </th>
                      <th className="border border-gray-300 dark:border-gray-700 p-3 text-left text-sm font-semibold dark:text-gray-100">
                        Asset Tag/Serial#
                      </th>
                      <th className="border border-gray-300 dark:border-gray-700 p-3 text-right text-sm font-semibold dark:text-gray-100">
                        Monthly Rate
                      </th>
                      <th className="border border-gray-300 dark:border-gray-700 p-3 text-center text-sm font-semibold dark:text-gray-100">
                        # of Months
                      </th>
                      <th className="border border-gray-300 dark:border-gray-700 p-3 text-right text-sm font-semibold dark:text-gray-100">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdRentalData.instruments.map(
                      (inst: InstrumentData, index: number) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm dark:text-gray-100">
                            {inst.instrument}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm text-right dark:text-gray-100">
                            ${inst.retailValue || "0.00"}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm dark:text-gray-100">
                            {inst.assetTag || "N/A"}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm text-right dark:text-gray-100">
                            ${inst.monthlyRate}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm text-center dark:text-gray-100">
                            {inst.numberOfMonths}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-700 p-3 text-sm text-right font-medium dark:text-gray-100">
                            ${inst.total}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-8">
                <div className="w-80 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-2 pb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Sub Total:
                    </span>
                    <span className="font-medium dark:text-gray-100">
                      ${createdRentalData.subTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2 pb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      TAX:
                    </span>
                    <span className="font-medium dark:text-gray-100">
                      ${createdRentalData.hst.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t-2 border-gray-300 dark:border-gray-600 pt-3 font-bold text-lg">
                    <span className="text-gray-800 dark:text-gray-100">
                      Total:
                    </span>
                    <span className="text-gray-800 dark:text-gray-100">
                      ${createdRentalData.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-6">
                <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-100">
                  Rental Agreement:
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-justify leading-relaxed text-gray-700 dark:text-gray-300">
                    I HAVE RECEIVED FROM ARCADIA ACADEMY OF MUSIC THE ABOVE
                    LISTED ITEMS WHICH I HAVE EXAMINED AND FIND TO BE IN GOOD
                    WORKING CONDITION. THE VALUE OF WHICH IS $
                    {createdRentalData.instruments
                      .reduce(
                        (sum, inst) =>
                          sum + parseFloat(inst.retailValue || "0"),
                        0
                      )
                      .toFixed(2)}
                    . I AM RENTING THIS FOR A PERIOD OF{" "}
                    {createdRentalData.duration} MONTH
                    {createdRentalData.duration > 1 ? "S" : ""} AT THE RATE OF $
                    {createdRentalData.instruments[0]?.monthlyRate || "0.00"}{" "}
                    (excl. taxes) PER MONTH. OVERDUE RENT WILL BE DEDUCTED FROM
                    THE DEPOSIT AT THE PRO RATA DAILY RATE. I,{" "}
                    <strong>{createdRentalData.customerName}</strong>, WILL BE
                    RESPONSIBLE FOR THE VALUE OF THE ITEMS, IF FOR ANY REASON
                    THEY ARE NOT RETURNED TO ARCADIA ACADEMY OF MUSIC. I,{" "}
                    <strong>{createdRentalData.customerName}</strong>, WILL ALSO
                    BE RESPONSIBLE FOR ANY DAMAGE TO THESE ITEMS BEYOND NORMAL
                    EXPECTED WEAR. I,{" "}
                    <strong>{createdRentalData.customerName}</strong>, WILL PAY
                    ANY FEES OR COSTS TO THE OWNER IN REPOSSESSING THE ITEMS OR
                    COLLECTING THE RENTALS DUE. AN ADDITIONAL CHARGE OF $5.00
                    WILL BE ADDED TO ALL RENTALS RETURNED AFTER THE DUE DATE.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border-2 border-dashed border-gray-400 dark:border-gray-600 p-4 rounded">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                        RENTAL EQUIPMENT IS NOT COVERED BY ARCADIA ACADEMY OF MUSIC INSURANCE
                      </p>
                    </div>
                    <div className="border-2 border-dashed border-gray-400 dark:border-gray-600 p-4 rounded">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                        RENTAL PAYMENTS DO NOT APPLY TO PURCHASE
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="w-1/2">
                      <p className="text-sm font-semibold mb-2 dark:text-gray-100">
                        Customer Signature:
                      </p>
                      <div className="border-b-2 border-gray-400 dark:border-gray-600 h-12"></div>
                    </div>
                    <div className="w-1/3">
                      <p className="text-sm font-semibold mb-2 dark:text-gray-100">
                        Date:
                      </p>
                      <div className="border-b-2 border-gray-400 dark:border-gray-600 h-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-6 pt-4 border-t bg-background">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseReceiptModal}>
                Close
              </Button>
              {onEmail && (
                <Button onClick={handleEmail}>Email</Button>
              )}
              <Button onClick={handlePrintReceipt}>Print</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}