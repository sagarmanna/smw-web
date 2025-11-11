"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { TeacherDetailsCard } from "../components/TeacherDetailsCard";
import { EmailCard } from "@/app/[location]/customers/components/EmailCard";
import { PhoneCard } from "@/app/[location]/customers/components/PhoneCard";
import { AddressCard } from "@/app/[location]/customers/components/AddressCard";
import { QualificationsCard } from "../components/QualificationsCard";
import { PRIVATE_PROGRAMS, GROUP_PROGRAMS } from "../components/QualificationsCard/AddQualificationModal";
import {
  // getTeacherById,
  // getTeacherInfo,
  // getTeacherPrivateQualifications,
  // getTeacherGroupQualifications,
  TeacherRow,
  TeacherInfoData,
  Qualification,
} from "../teachers.api";

interface PhoneNumber {
  id: string;
  label: string;
  number: string;
  extension?: string;
  note?: string;
}

interface Email {
  id: string;
  label: string;
  email: string;
  note?: string;
  isPrimary?: boolean;
}

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  cityId: number;
  provinceId: number;
  countryId: number;
  postalCode: string;
  note?: string;
  isPrimary?: boolean;
}

interface TeachersDetailClientProps {
  location: string;
  id: string;
}

export function TeachersDetailClient({
  location,
  id,
}: TeachersDetailClientProps) {
  const router = useRouter();
  const [teacher, setTeacher] = React.useState<TeacherRow | null>(null);
  const [_teacherInfo, setTeacherInfo] =
    React.useState<TeacherInfoData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Local state for editable teacher details
  const [localFirstName, setLocalFirstName] = React.useState<string>("");
  const [localLastName, setLocalLastName] = React.useState<string>("");
  const [role, setRole] = React.useState<string>("Teacher");
  const [birthDate, setBirthDate] = React.useState<string | undefined>(
    undefined
  );
  const [picture, setPicture] = React.useState<string | undefined>(undefined);

  // Additional teacher data states
  const [phones, setPhones] = React.useState<PhoneNumber[]>([]);
  const [emails, setEmails] = React.useState<Email[]>([]);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [privateQualifications, setPrivateQualifications] = React.useState<
    Qualification[]
  >([]);
  const [groupQualifications, setGroupQualifications] = React.useState<
    Qualification[]
  >([]);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // TODO: API calls are on hold during UI development
        // Uncomment these when backend is ready:
        
        // const teacherData = await getTeacherById(location, Number(id));
        // const infoResponse = await getTeacherInfo(location, Number(id));
        // const privateQualsResponse = await getTeacherPrivateQualifications(location, Number(id));
        // const groupQualsResponse = await getTeacherGroupQualifications(location, Number(id));

        // MOCK DATA - Using this for UI development
        setLocalFirstName("tes123");
        setLocalLastName("12345");
        setRole("Teacher");
        setBirthDate("1992-01-17");

        // Mock emails
        setEmails([
          {
            id: "1",
            label: "Work",
            email: "1@example.com",
            note: "",
            isPrimary: true,
          },
          {
            id: "2",
            label: "Home",
            email: "123@example.com",
            note: "test note",
            isPrimary: false,
          },
        ]);

        // Mock phones
        setPhones([
          {
            id: "1",
            label: "Home",
            number: "(553) 900-0000",
            extension: "7544",
            note: "test",
          },
        ]);

        // Mock addresses - empty for now
        setAddresses([]);

        // Mock private qualifications
        setPrivateQualifications([
          { id: 1, name: "Test65", rate: 10.00 },
          { id: 2, name: "test72.5", rate: 10.00 },
          { id: 3, name: "Instrument", rate: 20.00 },
          { id: 4, name: "xClarinet", rate: 36.00 },
          { id: 5, name: "xPiano Contemporary", rate: 10.00 },
          { id: 6, name: "xGuitar Core", rate: 10.00 },
          { id: 7, name: "xGuitar Contemporary", rate: 10.00 },
          { id: 8, name: "xGuitar Hybrid", rate: 10.00 },
          { id: 9, name: "xPiano Hybrid", rate: undefined },
          { id: 10, name: "40th Anniversary Vocal", rate: 25.00 },
          { id: 11, name: "Rami Test Program", rate: 30.00 },
        ]);

        // Mock group qualifications
        setGroupQualifications([
          { id: 12, name: "Rami Group Program", rate: 20.00 },
        ]);

      } catch (error) {
        console.error("Error loading teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location, id]);

  // Handle details save
  const handleDetailsSave = React.useCallback(
    (newData: {
      firstName: string;
      lastName: string;
      role: string;
      birthDate?: string;
      picture?: string;
    }) => {
      // Update local names immediately
      setLocalFirstName(newData.firstName);
      setLocalLastName(newData.lastName);

      // Update teacher state with new data
      setTeacher((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          firstName: newData.firstName,
          lastName: newData.lastName,
        };
      });

      setRole(newData.role);
      setBirthDate(newData.birthDate);
      setPicture(newData.picture);
    },
    []
  );

  // Define action menu groups
  const teacherActionMenuGroups: ActionMenuGroup[] = [
    
    {
      label: "Actions",
      items: [
        {
          label: "Delete",
          onClick: () => {
            // TODO: Implement teacher deletion
          },
          variant: "destructive",
        },
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-black -mt-2">
      <DetailHeaderWithProfile
        breadcrumbItems={[
          {
            label: "Teachers",
            onClick: () => router.push(`/${location}/teachers/`),
          },
        ]}
        currentPageTitle={
          localFirstName && localLastName
            ? `${localFirstName} ${localLastName}`
            : id
        }
        loading={loading}
        actionMenuGroups={teacherActionMenuGroups}
        actionButtonAriaLabel="Teacher actions"
        showProfileIcon={true}
        profileIconSize="md"
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4 lg:items-start">
        {/* Left Column */}
        <div className="space-y-3 sm:space-y-4">
          {/* Details Card */}
          <TeacherDetailsCard
            data={{
              firstName: localFirstName,
              lastName: localLastName,
              role: role,
              birthDate: birthDate,
              picture: picture,
            }}
            onSave={handleDetailsSave}
            loading={loading}
            location={location}
            teacherId={Number(id)}
          />

          {/* Private Qualifications */}
          <QualificationsCard
            title="Private Qualifications"
            qualifications={privateQualifications}
            type="private"
            onView={() => {
              // TODO: Open view modal
            }}
            onAdd={(newQualifications) => {
              // Add new qualifications to the list
              const nextId = privateQualifications.length > 0 
                ? Math.max(...privateQualifications.map(q => q.id)) + 1 
                : 1;
              
              const qualificationsToAdd = newQualifications.map((qual, index) => {
                // Find the program label from the program value
                const program = PRIVATE_PROGRAMS.find(p => p.value === qual.program);
                return {
                  id: nextId + index,
                  name: program?.label || qual.program,
                  rate: qual.rate,
                };
              });
              
              setPrivateQualifications([...privateQualifications, ...qualificationsToAdd]);
            }}
            loading={loading}
          />

          {/* Group Qualifications */}
          <QualificationsCard
            title="Group Qualifications"
            qualifications={groupQualifications}
            type="group"
            onView={() => {
              // TODO: Open view modal
            }}
            onAdd={(newQualifications) => {
              // Add new qualifications to the list
              const nextId = groupQualifications.length > 0 
                ? Math.max(...groupQualifications.map(q => q.id)) + 1 
                : 1;
              
              const qualificationsToAdd = newQualifications.map((qual, index) => {
                // Find the program label from the program value
                const program = GROUP_PROGRAMS.find(p => p.value === qual.program);
                return {
                  id: nextId + index,
                  name: program?.label || qual.program,
                  rate: qual.rate,
                };
              });
              
              setGroupQualifications([...groupQualifications, ...qualificationsToAdd]);
            }}
            loading={loading}
          />

          {/* Mobile Email and Phone Cards - Only on Mobile */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            <EmailCard
              emails={emails}
              onAddClick={() => {}}
              onSave={setEmails}
              loading={loading}
              location={location}
              customerId={Number(id)}
            />

            <PhoneCard
              phones={phones}
              onSave={(newPhones) => setPhones(newPhones)}
              loading={loading}
              location={location}
              customerId={Number(id)}
            />
          </div>
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-3 sm:space-y-4">
          {/* Desktop Email and Phone Cards */}
          <div className="hidden lg:block">
            <EmailCard
              emails={emails}
              onAddClick={() => {}}
              onSave={setEmails}
              loading={loading}
              location={location}
              customerId={Number(id)}
            />
          </div>

          <div className="hidden lg:block">
            <PhoneCard
              phones={phones}
              onSave={(newPhones) => setPhones(newPhones)}
              loading={loading}
              location={location}
              customerId={Number(id)}
            />
          </div>

          <AddressCard
            addresses={addresses}
            onSave={(newAddresses) => setAddresses(newAddresses)}
            loading={loading}
            location={location}
            customerId={Number(id)}
          />
        </div>
      </div>
    </div>
  );
}

