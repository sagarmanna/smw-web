"use client";

import React, { useState } from "react";
import { InfoCard } from "@/components/InfoCard";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"; 

interface PhoneNumber {
  id: string;
  label: string;
  number: string;
  extension?: string;
  note?: string;
}

interface PhoneCardProps {
  phones?: PhoneNumber[];
  onAddClick?: () => void;
  onSave?: (phones: PhoneNumber[]) => void;
  className?: string;
}

export function PhoneCard({ 
  phones = [],
  onAddClick, 
  onSave,
  className 
}: PhoneCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneList, setPhoneList] = useState<PhoneNumber[]>([]);
  const [editingPhone, setEditingPhone] = useState<PhoneNumber | null>(null);
  const [currentPhone, setCurrentPhone] = useState({ 
    label: "Home", 
    number: "", 
    extension: "", 
    note: "" 
  });
  const [errors, setErrors] = useState({ number: "" });

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCurrentPhone({ ...currentPhone, number: formatted });
    if (errors.number) setErrors({ number: "" });
  };

  const validateForm = () => {
    const newErrors = { number: "" };
    const digitsOnly = currentPhone.number.replace(/\D/g, '');
    if (digitsOnly.trim() === "") newErrors.number = "Number cannot be blank.";
    else if (digitsOnly.length !== 10) newErrors.number = "Please enter a valid 10-digit phone number.";
    setErrors(newErrors);
    return newErrors.number === "";
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
    setPhoneList(phones.length > 0 ? [...phones] : []);
    setEditingPhone(null);
    setCurrentPhone({ label: "Home", number: "", extension: "", note: "" });
    setErrors({ number: "" });
    if (onAddClick) onAddClick();
  };

  const handleEditPhone = (phone: PhoneNumber) => {
    setEditingPhone(phone);
    setCurrentPhone({
      label: phone.label,
      number: phone.number,
      extension: phone.extension || "",
      note: phone.note || ""
    });
    setErrors({ number: "" });
  };

  const handleRemovePhone = (id: string) => {
    setPhoneList(phoneList.filter(phone => phone.id !== id));
  };

  const handleSave = () => {
    if (!validateForm()) return;

    let updatedList = [...phoneList];

    if (editingPhone) {
      updatedList = phoneList.map(phone => 
        phone.id === editingPhone.id 
          ? { ...phone, ...currentPhone }
          : phone
      );
    } else {
      const newPhone: PhoneNumber = {
        id: Date.now().toString(),
        ...currentPhone
      };
      updatedList = [...phoneList, newPhone];
    }

    setPhoneList(updatedList);
    if (onSave) onSave(updatedList);

    setIsModalOpen(false);
    setEditingPhone(null);
    setCurrentPhone({ label: "Home", number: "", extension: "", note: "" });
    setErrors({ number: "" });
  };

  const handleCancel = () => {
    setPhoneList([]);
    setEditingPhone(null);
    setCurrentPhone({ label: "Home", number: "", extension: "", note: "" });
    setErrors({ number: "" });
    setIsModalOpen(false);
  };

  const modalActions = [
    { label: "Cancel", onClick: handleCancel, variant: "outline" as const },
    { label: "Save", onClick: handleSave, variant: "default" as const }
  ];

  return (
    <>
      <InfoCard title="Phone" onAddClick={handleAddClick} className={className}>
        <div className="space-y-2">
          {phones.length > 0 ? (
            phones.map(phone => (
              <div key={phone.id} className="flex justify-between items-start">
                <span className="text-sm text-gray-600">{phone.label}</span>
                <div className="text-right">
                  <div className="font-medium">{phone.number}</div>
                  {phone.extension && <div className="text-xs text-gray-500">Ext: {phone.extension}</div>}
                  {phone.note && <div className="text-xs text-gray-500 mt-1">{phone.note}</div>}
                </div>
              </div>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No phone numbers added</span>
          )}
        </div>
      </InfoCard>

      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Phone"
        size="md"
        actions={modalActions}
        showFooter={true}
      >
        <div className="space-y-4">
          {phoneList.length > 0 && !editingPhone && (
            <div className="space-y-2 pb-4 border-b">
              {phoneList.map(phone => (
                <div key={phone.id} className="flex items-center gap-2 p-3 border rounded-md hover:bg-gray-50">
                  <div className="flex-1 cursor-pointer" onClick={() => handleEditPhone(phone)}>
                    <div className="text-sm text-gray-600">{phone.label}</div>
                    <div className="font-medium">{phone.number}</div>
                    {phone.extension && <div className="text-xs text-gray-500">Ext: {phone.extension}</div>}
                    {phone.note && <div className="text-xs text-gray-500 mt-1">{phone.note}</div>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePhone(phone.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Phone Form */}
          <div className="space-y-4">
            {editingPhone && <div className="text-sm text-blue-600 mb-2">Editing phone number</div>}

            <div className="space-y-2">
              <Label htmlFor="phone-number">Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone-number"
                type="tel"
                value={currentPhone.number}
                onChange={handlePhoneNumberChange}
                placeholder="(___) ___-____"
                maxLength={14}
                className={errors.number ? "border-red-500" : ""}
              />
              {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-label">Label</Label>
              <Select value={currentPhone.label} onValueChange={value => setCurrentPhone({ ...currentPhone, label: value })}>
                <SelectTrigger id="phone-label">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-extension">Extension</Label>
              <Input
                id="phone-extension"
                type="text"
                value={currentPhone.extension}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentPhone({ ...currentPhone, extension: e.target.value })
                }
                placeholder="Enter extension"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-note">Note</Label>
              <Textarea
                id="phone-note"
                value={currentPhone.note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCurrentPhone({ ...currentPhone, note: e.target.value })
                }
                placeholder="Enter note"
                rows={3}
              />
            </div>
          </div>
        </div>
      </ReusableModal>
    </>
  );
}
