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
import { format, differenceInCalendarDays } from "date-fns";
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

export interface CreatedRentalData {
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
  onEmailClick?: (rentalData: CreatedRentalData) => void;
  onEmail?: (payload: {
    subject: string;
    content: string;
  }) => void;
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
            readOnly
          />
        </td>
        <td className="p-2">
          <div className="flex items-center justify-end gap-2">
            <Input
              value={instrument.total}
              readOnly
              placeholder="0.00"
              className="w-full bg-gray-50 dark:bg-gray-800"
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
  onEmailClick,
  onEmail,
}: EquipmentRentalsModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [returning, setReturning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

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
    },
  ]);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);

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
              numberOfMonths:
                inst.numberOfMonths && inst.numberOfMonths !== "0"
                  ? inst.numberOfMonths
                  : "1",
              total: "0.00",
            };
          }

          // Calculate per day rate based on 30 days per month
          const perDayRate = monthlyRate / DAYS_PER_MONTH;
          const total = perDayRate * totalDays;

          return {
            ...inst,
            numberOfMonths:
              inst.numberOfMonths && inst.numberOfMonths !== "0"
                ? inst.numberOfMonths
                : "1",
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

          // If "On Going" is true, ALWAYS clear duration and return date
          // Even if API returns returnDate, we ignore it for ongoing rentals
          if (onGoing) {
            duration = "";
            returnDate = undefined; // Explicitly clear return date for ongoing rentals
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
          
          // Final safeguard: If onGoing is true, ensure returnDate is always undefined
          if (onGoing) {
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
          returnDate: onGoing ? undefined : returnDate, // Clear returnDate if onGoing is true
          securityDeposit:
            rentalDetails?.securityDeposit !== undefined &&
            rentalDetails?.securityDeposit !== null
              ? Boolean(rentalDetails.securityDeposit)
                ? "yes"
                : "no"
              : "no",
          tenderType: rentalDetails?.tenderType?.toString() || "",
          depositAmount: rentalDetails?.depositAmount || "",
        };

        // If onGoing is true, ensure returnDate is ALWAYS undefined in newFormData
        // CRITICAL: Must be done BEFORE setting formData to prevent any calculations
        if (onGoing) {
          newFormData.returnDate = undefined;
          newFormData.duration = "";
        }
        
        // Use flushSync to ensure state updates synchronously so useMemo computes correctly
        flushSync(() => {
          setFormData(newFormData);
        });

        // Additional safeguard: ensure returnDate is cleared if onGoing is true - run immediately
        if (onGoing) {
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
            (inst, index) => ({
              id: `rented-${inst.instrumentId}-${index}`,
              instrumentId: inst.instrumentId,
              instrumentCode: inst.instrumentCode,
              instrument: inst.instrument,
              retailValue: inst.retailValue || "",
              assetTag: inst.assetTag || "",
              monthlyRate: inst.monthlyRate || "0",
              numberOfMonths: inst.numberOfMonths || "",
              total: inst.total || "0.00",
            })
          );
          setInstruments(mappedInstruments);
        } else if (rentalId) {
          setInstruments([]);
        } else {
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
  useEffect(() => {
    if (formData.onGoing === true) {
      // ALWAYS clear returnDate and duration when onGoing is true
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
  }, [formData.onGoing, formData.returnDate, formData.duration]);

  // Compute return date input value - MUST always be empty when onGoing is true
  // This MUST check onGoing FIRST before any other logic
  const returnDateInputValue = useMemo(() => {
    // CRITICAL: ABSOLUTE first check - if onGoing is true, ALWAYS return empty string
    // Do not check returnDate, do not format, just return empty immediately
    if (formData.onGoing === true) {
      return "";
    }
    // Only format date if onGoing is false AND returnDate exists AND is valid
    if (formData.returnDate && formData.returnDate instanceof Date && !isNaN(formData.returnDate.getTime())) {
      return format(formData.returnDate, "MMM dd, yyyy");
    }
    // Default: return empty string
    return "";
  }, [formData.onGoing, formData.returnDate]);

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
          // Both fields should be blank as shown in the UI
          newData.duration = "";
          newData.returnDate = undefined;
          
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
        // Keep return date blank when "On Going" is checked
        // Only update instruments for ongoing billing calculation
        if (newData.rentalStartDate instanceof Date) {
          // Update instruments when start date changes (for ongoing billing)
          updateInstrumentsForOngoing(newData.rentalStartDate);
        }
        // Return date should remain blank/undefined for ongoing rentals
        newData.returnDate = undefined;
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
      if (newData.onGoing) {
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
          [field]: value,
        };

        // When instrument is selected, set numberOfMonths from duration
        if (field === "instrumentId") {
          const durationMatch = formData.duration.match(/^(\d+)-month/i);
          if (durationMatch) {
            updated.numberOfMonths = durationMatch[1];
          } else if (formData.onGoing) {
            updated.numberOfMonths = "1";
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

            if (!updated.numberOfMonths || updated.numberOfMonths === "0") {
              updated.numberOfMonths = "1";
            }
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
      numberOfMonths = "1";
    } else if (formData.duration) {
      const durationMatch = formData.duration.match(/^(\d+)-month/i);
      if (durationMatch) {
        numberOfMonths = durationMatch[1];
      }
    }

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
    };
    setInstruments((prev) => [...prev, newInstrument]);
  };

  const handleDeleteInstrument = (id: string) => {
    setInstruments((prev) => {
      const filtered = prev.filter((instrument) => instrument.id !== id);
      if (filtered.length === 0) {
        let numberOfMonths = "1";
        if (formData.duration) {
          const durationMatch = formData.duration.match(/^(\d+)-month/i);
          if (durationMatch) {
            numberOfMonths = durationMatch[1];
          }
        }
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

      const tenderTypeMap: Record<string, string> = {
        cash: "1",
        "credit-card": "2",
        preauthorized: "3",
      };
      const tenderTypeNumber =
        tenderTypeMap[formData.tenderType] || formData.tenderType || "";

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
      const hst = subTotal * 0.13;
      const instrumentsTotal = subTotal + hst;

      // Call API to create equipment rental
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
    const hst = subTotal * 0.13;
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

      const returnDate = new Date();
      const returnDateFormatted = format(returnDate, "MMM dd, yyyy");
      const returnDateISO = format(returnDate, "yyyy-MM-dd");

      const filledInstruments = instruments.filter(
        (inst) => inst.instrumentId > 0
      );

      const mappedInstruments =
        filledInstruments.length > 0
          ? filledInstruments.map((instrument) => {
              const instrumentTotal = parseFloat(instrument.total || "0");
              const instrumentTax = (instrumentTotal * 0.13).toFixed(2);
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
              const instrumentTax = (instrumentTotal * 0.13).toFixed(2);
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

  const handleEmail = () => {
    if (!createdRentalData) return;

    if (onEmail) {
      // Generate email content similar to PaymentReceiptModal
      const subject = `Equipment Rental Receipt - ${createdRentalData.customerName}`;
      const content = `
        <h2>Equipment Rental Receipt</h2>
        <p><strong>Customer:</strong> ${createdRentalData.customerName}</p>
        <p><strong>Student:</strong> ${createdRentalData.studentFirstName} ${createdRentalData.studentLastName}</p>
        <p><strong>Start Date:</strong> ${createdRentalData.startDate}</p>
        <p><strong>Duration:</strong> ${createdRentalData.duration} Month${createdRentalData.duration > 1 ? 's' : ''}</p>
        ${createdRentalData.returnDate ? `<p><strong>Return Date:</strong> ${createdRentalData.returnDate}</p>` : '<p><strong>Status:</strong> On Going</p>'}
        <h3>Instruments:</h3>
        <ul>
          ${createdRentalData.instruments.map(inst => 
            `<li>${inst.instrument} - $${inst.total}</li>`
          ).join('')}
        </ul>
        <p><strong>Sub Total:</strong> $${createdRentalData.subTotal.toFixed(2)}</p>
        <p><strong>HST:</strong> $${createdRentalData.hst.toFixed(2)}</p>
        <p><strong>Total:</strong> $${createdRentalData.total.toFixed(2)}</p>
      `;
      
      onEmail({
        subject,
        content,
      });
    } else if (onEmailClick) {
      // Fallback to onEmailClick for backward compatibility
      onEmailClick(createdRentalData);
    }
  };

  const filledInstruments = instruments.filter((inst) => inst.instrumentId > 0);
  const subTotal = filledInstruments.reduce(
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
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
            {isEditMode ? (
              (() => {
                const durationMatch = formData.duration.match(/^(\d+)-month/i);
                const durationMonths = durationMatch ? parseInt(durationMatch[1]) : 0;
                const isEnabled = durationMonths > 2;

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
                      HST (13%):
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
              <Button onClick={handleEmail}>Email</Button>
              <Button onClick={handlePrintReceipt}>Print</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}