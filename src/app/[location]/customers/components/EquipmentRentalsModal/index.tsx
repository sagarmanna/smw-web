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
  type RentedInstrument,
  type RentalDetails,
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

const calculateReturnDate = (startDate: Date, months: number): Date => {
  const dayOfMonth = startDate.getDate();
  const returnDate = new Date(startDate.getTime());

  if (dayOfMonth >= 1 && dayOfMonth <= 7) {
    returnDate.setMonth(returnDate.getMonth() + months - 1);
    returnDate.setMonth(returnDate.getMonth() + 1, 0);
  } else {
    returnDate.setMonth(returnDate.getMonth() + months);
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
  onDelete,
}: EquipmentRentalsModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [returning, setReturning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    rentalStartDate: new Date(),
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
      numberOfMonths: "",
      total: "0.00",
    },
  ]);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);

  const isEditMode = Boolean(rentalId);

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

        // Populate form data - prioritize rentalDetails when in edit mode
        let rentalStartDate: Date;
        let returnDate: Date | undefined;
        let duration: string = "";
        let onGoing: boolean = false;
        let studentId: string = "";

        if (rentalId && rentalDetails) {
          // Edit mode - use actual rental data
          // Parse dates correctly - handle YYYY-MM-DD format
          rentalStartDate = rentalDetails.startDate
            ? new Date(rentalDetails.startDate + "T00:00:00")
            : new Date();
          returnDate = rentalDetails.returnDate
            ? new Date(rentalDetails.returnDate + "T00:00:00")
            : undefined;
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

          if (
            !returnDate &&
            !onGoing &&
            rentalDetails.startDate &&
            rentalDetails.duration
          ) {
            returnDate = calculateReturnDate(
              new Date(rentalDetails.startDate + "T00:00:00"),
              rentalDetails.duration
            );
          }
        } else {
          rentalStartDate = new Date();
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
          duration: duration,
          returnDate: returnDate,
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

        setFormData(newFormData);

        // Set created date for delete button visibility logic
        if (rentalId && rentalDetails?.createdOn) {
          setRentalCreatedOn(new Date(rentalDetails.createdOn + "T00:00:00"));
        } else {
          setRentalCreatedOn(null);
        }

        // Populate instruments table if in edit mode and rented instruments are available
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
          // Edit mode but no rented instruments found - log warning
          // Keep empty instruments array for edit mode to show empty state
          setInstruments([]);
        } else {
          // Create mode - use default empty row
          setInstruments([
            {
              id: "initial",
              instrumentId: 0,
              instrumentCode: "",
              instrument: "",
              retailValue: "",
              assetTag: "",
              monthlyRate: "0",
              numberOfMonths: "",
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

  // Recalculate instrument totals when dates or duration change (if both dates are present)
  useEffect(() => {
    if (
      !formData.onGoing &&
      formData.rentalStartDate &&
      formData.returnDate &&
      instruments.length > 0
    ) {
      // Only recalculate if we have instruments with monthly rates
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

  const calculateTotalFromDates = (
    startDate: Date,
    returnDate: Date,
    monthlyRate: number,
    duration?: string
  ): string => {
    if (!startDate || !returnDate || monthlyRate <= 0) {
      return "0.00";
    }

    // Calculate actual difference in days (return date is inclusive)
    const diffTime = returnDate.getTime() - startDate.getTime();
    const actualDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (!duration) {
      const daysPerMonth = 30;
      const perDayRate = monthlyRate / daysPerMonth;
      const total = actualDays * perDayRate;
      return total.toFixed(2);
    }

    // Extract duration in months (e.g., "1-month" -> 1, "2-months" -> 2)
    const durationMatch = duration.match(/^(\d+)-month/);
    if (!durationMatch) {
      // Fallback to day-based calculation if duration format is invalid
      const daysPerMonth = 30;
      const perDayRate = monthlyRate / daysPerMonth;
      const total = actualDays * perDayRate;
      return total.toFixed(2);
    }

    const durationMonths = parseInt(durationMatch[1]);
    if (isNaN(durationMonths) || durationMonths <= 0) {
      const daysPerMonth = 30;
      const perDayRate = monthlyRate / daysPerMonth;
      const total = actualDays * perDayRate;
      return total.toFixed(2);
    }

    // Calculate minimum charge for selected duration
    const minimumCharge = monthlyRate * durationMonths;
    
    // Calculate expected days for the duration (30 days per month)
    const daysPerMonth = 30;
    const expectedDays = durationMonths * daysPerMonth;
    
    // Calculate per day rate for extra days
    const perDayRate = monthlyRate / daysPerMonth;

    if (actualDays > expectedDays) {
      const extraDays = actualDays - expectedDays;
      const total = minimumCharge + extraDays * perDayRate;
      return total.toFixed(2);
    }
    
    // If actual days <= expected days, charge minimum (don't reduce)
    return minimumCharge.toFixed(2);
  };

  // Recalculate all instrument totals based on date difference with duration consideration
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
          newData.duration = "";
          newData.returnDate = undefined;
          // Set instrument numberOfMonths to 1 when ongoing is checked
          setInstruments((prevInstruments) =>
            prevInstruments.map((inst) => {
              const monthlyRate = parseFloat(inst.monthlyRate || "0");
              const total =
                monthlyRate > 0 ? (monthlyRate * 1).toFixed(2) : "0.00";
              return {
                ...inst,
                numberOfMonths: "1",
                total: total,
              };
            })
          );
        } else {
          if (newData.rentalStartDate && newData.duration) {
            const durationMatch = newData.duration.match(/^(\d+)-month/);
            if (durationMatch) {
              const months = parseInt(durationMatch[1]);
              if (!isNaN(months) && months > 0) {
                newData.returnDate = calculateReturnDate(
                  newData.rentalStartDate,
                  months
                );
              }
            }
          }
        }
      }

      if (
        (field === "rentalStartDate" || field === "duration") &&
        !newData.onGoing
      ) {
        if (newData.rentalStartDate && newData.duration) {
          const durationMatch = newData.duration.match(/^(\d+)-month/);
          if (durationMatch) {
            const months = parseInt(durationMatch[1]);
            if (!isNaN(months) && months > 0) {
              newData.returnDate = calculateReturnDate(
                newData.rentalStartDate,
                months
              );
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

      // Update all instruments' numberOfMonths when duration changes (matching legacy behavior)
      if (field === "duration" && !newData.onGoing) {
        const durationMatch = String(value).match(/^(\d+)-month/);
        if (durationMatch) {
          const months = durationMatch[1];
          setInstruments((prev) =>
            prev.map((inst) => {
              const updated = {
                ...inst,
                numberOfMonths: months,
              };

              if (
                newData.rentalStartDate &&
                newData.returnDate &&
                inst.monthlyRate
              ) {
                const monthlyRate = parseFloat(inst.monthlyRate || "0");
                if (monthlyRate > 0) {
                  updated.total = calculateTotalFromDates(
                    newData.rentalStartDate,
                    newData.returnDate,
                    monthlyRate,
                    String(value)
                  );
                } else {
                  updated.total = "0.00";
                }
              } else {
                // Fallback to monthly calculation if dates not available
                updated.total =
                  inst.monthlyRate && parseFloat(inst.monthlyRate) > 0
                    ? (parseFloat(inst.monthlyRate) * parseInt(months)).toFixed(
                        2
                      )
                    : "0.00";
              }

              return updated;
            })
          );
        }
      }

      // Recalculate instrument totals based on date difference when dates change
      if (
        (field === "rentalStartDate" || field === "returnDate") &&
        !newData.onGoing &&
        newData.rentalStartDate &&
        newData.returnDate
      ) {
        // Use setTimeout to ensure state is updated before recalculating
        setTimeout(() => {
          recalculateInstrumentTotalsFromDates(
            newData.rentalStartDate,
            newData.returnDate,
            newData.duration
          );
        }, 0);
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

        if (field === "monthlyRate" || field === "numberOfMonths") {
          const monthlyRate = parseFloat(updated.monthlyRate || "0");

          if (
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
            // Fallback to monthly calculation
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
    const newInstrument: InstrumentData = {
      id: Date.now().toString(),
      instrumentId: 0,
      instrumentCode: "",
      instrument: "",
      retailValue: "",
      assetTag: "",
      monthlyRate: "0",
      numberOfMonths: "",
      total: "0.00",
    };
    setInstruments((prev) => [...prev, newInstrument]);
  };

  const handleDeleteInstrument = (id: string) => {
    setInstruments((prev) => {
      const filtered = prev.filter((instrument) => instrument.id !== id);
      // Always keep at least one row
      if (filtered.length === 0) {
        return [
          {
            id: Date.now().toString(),
            instrumentId: 0,
            instrumentCode: "",
            instrument: "",
            retailValue: "",
            assetTag: "",
            monthlyRate: "0",
            numberOfMonths: "",
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
        onOpenChange(false);
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
                // Enable Equipment Returned button only if return date exists and today >= return date (matching legacy logic)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const returnDate = formData.returnDate
                  ? new Date(formData.returnDate)
                  : null;
                if (returnDate) {
                  returnDate.setHours(0, 0, 0, 0);
                }
                const isEnabled = returnDate && today >= returnDate;

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

      {/* Delete Confirmation Modal */}
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
    </Dialog>
  );
}
