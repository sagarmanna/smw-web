"use client";

import * as React from "react";

import { useAppSelector } from "@/redux/hooks";
import type {
  GenericAddress,
  GenericBasicDetails,
  GenericEmail,
  GenericPhone,
} from "@/components/user-details/types/common";

import UserProfileDetailsCard from "./components/cards/UserProfileDetailsCard";
import UserProfileAddressCard from "./components/cards/UserProfileAddressCard";
import UserProfilePhoneCard from "./components/cards/UserProfilePhoneCard";
import UserProfileEmailCard from "./components/cards/UserProfileEmailCard";

function splitName(fullName?: string) {
  const trimmed = (fullName || "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default function UserProfileClient() {
  const { userInfo, isLoading } = useAppSelector((s) => s.user);

  const [location, setLocation] = React.useState<string>("");
  const [entityId, setEntityId] = React.useState<number>(0);

  React.useEffect(() => {
    setLocation(localStorage.getItem("location") || "");
    const idStr = localStorage.getItem("id");
    setEntityId(userInfo?.id ?? (idStr ? Number(idStr) : 0));
  }, [userInfo?.id]);

  const [details, setDetails] = React.useState<GenericBasicDetails | null>(null);
  const [emails, setEmails] = React.useState<GenericEmail[]>([]);
  const [phones, setPhones] = React.useState<GenericPhone[]>([]);
  const [addresses, setAddresses] = React.useState<GenericAddress[]>([]);

  // Initialize mock profile content once userInfo is available
  React.useEffect(() => {
    // UI-only mock defaults (screenshot-style)
    const fallbackName = splitName("Deena Ali");
    const { firstName, lastName } = splitName(userInfo?.fullName) || fallbackName;
    const defaultEmail = userInfo?.primaryEmail || "dinahatim@example.com";
    const defaultRole = userInfo?.displayRole || userInfo?.role || "Customer";

    setDetails((prev) => {
      if (prev) return prev;
      return {
        firstName,
        lastName,
        role: defaultRole,
      };
    });

    setEmails((prev) => {
      if (prev.length) return prev;
      return [
        {
          id: "email-1",
          label: "Home",
          email: defaultEmail,
          isPrimary: true,
        },
      ];
    });

    setPhones((prev) => {
      if (prev.length) return prev;
      return [
        {
          id: "phone-1",
          label: "Home",
          number: "(647) 294-6552",
          // used by drag-to-top behavior to show "Primary"
          isPrimary: true,
        } as GenericPhone & { isPrimary?: boolean },
      ];
    });

    setAddresses((prev) => {
      if (prev.length) return prev;
      return [
        {
          id: "addr-1",
          label: "Home",
          address: "3901 Koenig Road",
          city: "Burlington",
          cityId: 0,
          provinceId: 1,
          countryId: 1,
          postalCode: "",
          province: "Ontario",
          country: "Canada",
          isPrimary: true,
        },
      ];
    });
  }, [userInfo]);

  const saveDetails = React.useCallback(async (newDetails: GenericBasicDetails) => {
    setDetails(newDetails);
    return true;
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {/* Left column */}
      <div className="space-y-3 sm:space-y-4">
        <UserProfileDetailsCard
          details={details}
          defaultRole="Customer"
          roleLabel="Role"
          onSaveDetails={saveDetails}
          savingDetails={false}
          isLoading={isLoading}
        />

        <UserProfileAddressCard
          addresses={addresses}
          onUpdate={setAddresses}
          loading={isLoading}
          location={location}
          entityId={entityId}
        />
      </div>

      {/* Right column */}
      <div className="space-y-3 sm:space-y-4">
        <UserProfilePhoneCard
          phones={phones}
          onUpdate={setPhones}
          loading={isLoading}
          location={location}
          entityId={entityId}
        />

        <UserProfileEmailCard
          emails={emails}
          onUpdate={setEmails}
          loading={isLoading}
          location={location}
          entityId={entityId}
        />
      </div>
    </div>
  );
}

