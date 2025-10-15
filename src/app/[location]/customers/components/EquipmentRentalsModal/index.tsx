"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Data interfaces
interface InstrumentData {
  id: string;
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
  student: string;
  rentalStartDate: Date | undefined;
  onGoing: boolean;
  duration: string;
  returnDate: Date | undefined;
  securityDeposit: "yes" | "no";
}

interface EquipmentRentalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: EquipmentRentalFormData & { instruments: InstrumentData[] }) => void;
  customerName?: string;
  customerEmail?: string;
}

// Mock data for instruments
const mockInstruments: InstrumentData[] = [];

// Separate form component to prevent re-renders
const InstrumentFormRow = React.memo(({ 
  newInstrument, 
  onNewInstrumentChange, 
  onInputFocus, 
  onInputBlur 
}: {
  newInstrument: InstrumentData;
  onNewInstrumentChange: (field: keyof InstrumentData, value: string) => void;
  onInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}) => {
  return (
    <tr className="border-b">
      <td className="p-2">
        <Select
          value={newInstrument.instrument}
          onValueChange={(value) => onNewInstrumentChange("instrument", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="--Select an opt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Rental Charge">Rental Charge</SelectItem>
            <SelectItem value="Guitar">Guitar</SelectItem>
            <SelectItem value="Piano">Piano</SelectItem>
            <SelectItem value="Violin">Violin</SelectItem>
            <SelectItem value="Drums">Drums</SelectItem>
            <SelectItem value="Saxophone">Saxophone</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-2">
        <Input
          value={newInstrument.retailValue}
          onChange={(e) => onNewInstrumentChange("retailValue", e.target.value)}
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
          onChange={(e) => onNewInstrumentChange("monthlyRate", e.target.value)}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          placeholder="0"
          className="w-full"
        />
      </td>
      <td className="p-2">
        <Input
          value={newInstrument.numberOfMonths}
          onChange={(e) => onNewInstrumentChange("numberOfMonths", e.target.value)}
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
          className="w-full bg-gray-50"
        />
      </td>
    </tr>
  );
});

InstrumentFormRow.displayName = "InstrumentFormRow";



export function EquipmentRentalsModal({
  open,
  onOpenChange,
  onSave,
  customerName = "123 123",
  customerEmail = "sample@example.com",
}: EquipmentRentalsModalProps) {
  const [formData, setFormData] = useState<EquipmentRentalFormData>({
    customer: customerName,
    address: "",
    city: "",
    postalCode: "",
    homePhone: "",
    workPhone: "",
    otherPhone: "",
    email: customerEmail,
    student: "Student",
    rentalStartDate: new Date(2025, 9, 1), // Oct 01, 2025
    onGoing: false,
    duration: "1-month",
    returnDate: new Date(2025, 9, 31), // Oct 31, 2025
    securityDeposit: "no",
  });

  const [instruments, setInstruments] = useState<InstrumentData[]>(mockInstruments);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);

  // New instrument form data
  const [newInstrument, setNewInstrument] = useState<InstrumentData>({
    id: "new",
    instrument: "",
    retailValue: "",
    assetTag: "",
    monthlyRate: "0",
    numberOfMonths: "1",
    total: "0.00",
  });


  const handleInputChange = (field: keyof EquipmentRentalFormData, value: string | boolean | Date) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Handle "On Going" checkbox functionality
      if (field === "onGoing") {
        if (value === true) {
          // If "On Going" is checked, clear duration and return date
          newData.duration = "";
          newData.returnDate = undefined;
        } else {
          // If "On Going" is unchecked, re-calculate return date if start date and duration exist
          if (newData.rentalStartDate && prev.duration) {
            const months = parseInt(prev.duration.split('-')[0]);
            const returnDate = new Date(newData.rentalStartDate);
            returnDate.setMonth(returnDate.getMonth() + months);
            newData.returnDate = returnDate;
          } else {
            newData.returnDate = undefined;
          }
        }
      }

      // Auto-calculate return date when rental start date or duration changes, only if not "On Going"
      if ((field === "rentalStartDate" || field === "duration") && !newData.onGoing) {
        if (newData.rentalStartDate && newData.duration) {
          const months = parseInt(newData.duration.split('-')[0]);
          const returnDate = new Date(newData.rentalStartDate);
          returnDate.setMonth(returnDate.getMonth() + months);
          newData.returnDate = returnDate;
        } else {
          newData.returnDate = undefined;
        }
      }

      return newData;
    });
  };

  const handleNewInstrumentChange = (field: keyof InstrumentData, value: string) => {
    setNewInstrument(prev => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Auto-calculate total when monthly rate or number of months changes
      if (field === "monthlyRate" || field === "numberOfMonths") {
        const monthlyRate = parseFloat(updated.monthlyRate || "0");
        const numberOfMonths = parseFloat(updated.numberOfMonths || "0");
        updated.total = (monthlyRate * numberOfMonths).toFixed(2);
      }

      return updated;
    });
  };

  // Handle input focus to prevent table re-rendering
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleAddInstrument = () => {
    if (newInstrument.instrument) {
      const instrument: InstrumentData = {
        ...newInstrument,
        id: Date.now().toString(),
        total: (parseFloat(newInstrument.monthlyRate) * parseFloat(newInstrument.numberOfMonths || "0")).toFixed(2),
      };
      setInstruments(prev => [...prev, instrument]);
      setNewInstrument({
        id: "new",
        instrument: "",
        retailValue: "",
        assetTag: "",
        monthlyRate: "0",
        numberOfMonths: "1",
        total: "0.00",
      });
    }
  };

  const handleDeleteInstrument = (id: string) => {
    setInstruments(prev => prev.filter(instrument => instrument.id !== id));
  };


  const handleSave = () => {
    onSave?.({
      ...formData,
      instruments,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Calculate totals
  const subTotal = instruments.reduce((sum, instrument) => sum + parseFloat(instrument.total || "0"), 0);
  const tax = subTotal * 0.13; // Assuming 13% tax
  const total = subTotal + tax;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Equipment Rentals</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6  space-y-4">
              {/* Customer and Rental Information Section */}
              <div className="space-y-4 p-6 ml-5">
                
                
                {/* Row 1: Customer only */}
                <div className="flex items-center gap-4">
                  <Label className="w-24">Customer</Label>
                  <Input
                    value={formData.customer}
                    onChange={(e) => handleInputChange("customer", e.target.value)}
                    className="w-48"
                  />
                </div>

                {/* Row 2: Address, City, P.C */}
                <div className="flex items-center gap-4">
                  <Label className="w-24">Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-48"
                  />
                  <Label className="w-16">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-48"
                  />
                  <Label className="w-8">P.C</Label>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    className="w-48"
                  />
                </div>

                {/* Row 3: Home Phone, Work Phone, Other Phone */}
                <div className="flex items-center gap-4">
                  <Label className="w-24">Home Phone</Label>
                  <Input
                    value={formData.homePhone}
                    onChange={(e) => handleInputChange("homePhone", e.target.value)}
                    className="w-48"
                  />
                  <Label className="w-24">Work Phone</Label>
                  <Input
                    value={formData.workPhone}
                    onChange={(e) => handleInputChange("workPhone", e.target.value)}
                    className="w-48"
                  />
                  <Label className="w-24">Other Phone</Label>
                  <Input
                    value={formData.otherPhone}
                    onChange={(e) => handleInputChange("otherPhone", e.target.value)}
                    className="w-48"
                  />
                </div>

                {/* Row 4: Email only */}
                <div className="flex items-center gap-4">
                  <Label className="w-24">Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-48"
                  />
                </div>

                {/* Row 5: Student only */}
                <div className="flex items-center gap-4">
                  <Label className="w-24">Student</Label>
                  <Select
                    value={formData.student}
                    onValueChange={(value) => handleInputChange("student", value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="321123 123">321123 123</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 6: Rental Start Date, On Going */}
                <div className="flex items-center gap-4">
                  <Label className=" w-32">Rental Start Date</Label>
                  <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-48 justify-start text-left font-normal",
                          !formData.rentalStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.rentalStartDate ? format(formData.rentalStartDate, "MMM dd, yyyy") : "Pick a date"}
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
                      onCheckedChange={(checked) => handleInputChange("onGoing", checked as boolean)}
                    />
                    <Label htmlFor="onGoing">On Going</Label>
                  </div>
                </div>

                {/* Row 7: Duration, Return Date */}
                <div className="flex items-center p-5 gap-4">
                  <Label className="w-24">Duration</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => handleInputChange("duration", value)}
                    disabled={formData.onGoing}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={`${i + 1}-month${i > 0 ? 's' : ''}`}>
                          {i + 1} Month{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Label className="w-24 ml-6">Return Date</Label>
                  <Input
                    value={formData.returnDate ? format(formData.returnDate, "MMM dd,yyyy") : ""}
                    readOnly
                    disabled={formData.onGoing}
                    className="bg-gray-50 w-48"
                    placeholder="Return Date"
                  />
                </div>

                {/* Row 8: Security Deposit */}
                <div className="flex items-start p-5  gap-4">
                  <Label className="text-lg font-medium w-48">Security Deposit</Label>
                  <RadioGroup
                    value={formData.securityDeposit}
                    onValueChange={(value) => handleInputChange("securityDeposit", value as "yes" | "no")}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes">Yes</Label>
                    </div>
                    <div className="flex items-center  space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>


               {/* Instrument Details Table Section */}
               <div className="space-y-4">
                 <h3 className="text-lg font-medium">Instrument Details</h3>
                 
                 {/* Custom Table with Form Row */}
                 <div className="border rounded-lg overflow-hidden">
                   <table className="w-full border-collapse">
                     <thead className="bg-gray-50 border-b">
                       <tr>
                         <th className="p-3 text-left font-medium">Instrument</th>
                         <th className="p-3 text-left font-medium">Retail Value</th>
                         <th className="p-3 text-left font-medium">Asset Tag/Serial#</th>
                         <th className="p-3 text-left font-medium">Monthly Rate</th>
                         <th className="p-3 text-left font-medium"># Of Months</th>
                         <th className="p-3 text-left font-medium">Total</th>
                       </tr>
                     </thead>
                     <tbody>
                       {/* Form Row */}
                       <InstrumentFormRow
                         newInstrument={newInstrument}
                         onNewInstrumentChange={handleNewInstrumentChange}
                         onInputFocus={handleInputFocus}
                         onInputBlur={handleInputBlur}
                       />
                       {/* Data Rows */}
                       {instruments.map((instrument) => (
                         <tr key={instrument.id} className="border-b">
                           <td className="p-3 font-medium">{instrument.instrument}</td>
                           <td className="p-3 text-right">{instrument.retailValue}</td>
                           <td className="p-3">{instrument.assetTag}</td>
                           <td className="p-3 text-right">{instrument.monthlyRate}</td>
                           <td className="p-3 text-right">{instrument.numberOfMonths}</td>
                           <td className="p-3">
                             <div className="flex items-center justify-end gap-2">
                               <span className="font-medium">{instrument.total}</span>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleDeleteInstrument(instrument.id)}
                                 className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
                 
                 {/* Add Instrument Button - Positioned below table */}
                 <div className="mt-4">
                   <Button onClick={handleAddInstrument} className="w-fit">
                     Add Instrument
                   </Button>
                 </div>
               </div>

          {/* Summary Section */}
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
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <Label>Total :</Label>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 p-6 pt-4 border-t bg-background">
          <Button variant="outline" onClick={handleCancel}>
            Close
          </Button>
          <Button onClick={handleSave}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
