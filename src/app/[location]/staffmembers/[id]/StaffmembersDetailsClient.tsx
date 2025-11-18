'use client';

import { useAppSelector } from '@/redux/hooks';
import { DetailHeader } from '@/components/DetailHeader';
import { InfoCard } from '@/components/InfoCard';
import { KeyValueDisplay } from '@/components/KeyValueDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, MapPin, User } from 'lucide-react';
import type { Email, Phone as PhoneType, Address } from './staffmembers-details.interface';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { ErrorDisplay } from '@/components/ErrorDisplay';

interface StaffmembersDetailsClientProps {
  location: string;
}

export default function StaffmembersDetailsClient({ location }: StaffmembersDetailsClientProps) {
  const staffMemberInfo = useAppSelector((state) => state.staffMember.staffMemberInfo);
  const isLoading = useAppSelector((state) => state.staffMember.isLoading);
  const error = useAppSelector((state) => state.staffMember.error);

  // Show full-page loading animation while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading staff member details..." 
          className="text-center"
        />
      </div>  
    );
  }

  // Error state
  if (!error) {
    return (
        <ErrorDisplay
          error={error}
          title="Unable to Load Staff Member Details"
          fallbackMessage="An unexpected error occurred while loading the staff member details. Please try again later."
        />
    );
  }

  // No data state
  if (!staffMemberInfo) {
    return (
      <div className="space-y-6">
        <DetailHeader
          breadcrumbItems={[
            { label: 'Staff Members', href: `/${location}/staffmembers` },
          ]}
          currentPageTitle="Staff Member"
          showActions={false}
        />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No staff member data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, email, phone, addresses } = staffMemberInfo;
  const primaryEmail = email.find((e) => e.isPrimary) || email[0];
  const primaryPhone = phone.find((p) => p.isPrimary) || phone[0];
  const primaryAddress = addresses.find((a) => a.isPrimary) || addresses[0];

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs */}
      <DetailHeader
        breadcrumbItems={[
          { label: 'Staff Members', href: `/${location}/staffmembers` },
        ]}
        currentPageTitle={profile.name}
        showActions={true}
        actionMenuGroups={[
          {
            items: [
              {
                label: 'Edit Staff Member',
                onClick: () => {
                  // TODO: Implement edit functionality
                  console.log('Edit staff member');
                },
              },
            ],
          },
        ]}
      />

      {/* Profile Information */}
      <InfoCard title="Profile Information" showAddButton={false}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {profile.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{profile.role}</p>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Contact Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Section */}
        <InfoCard 
          title="Email Addresses" 
          showAddButton={true}
          onAddClick={() => {
            // TODO: Implement add email functionality
            console.log('Add email');
          }}
        >
          {email.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No email addresses</p>
          ) : (
            <div className="space-y-3">
              {email.map((emailItem: Email) => (
                <div
                  key={emailItem.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {emailItem.email}
                      </span>
                      {emailItem.isPrimary && (
                        <Badge variant="default" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{emailItem.label}</span>
                      {emailItem.note && (
                        <>
                          <span>•</span>
                          <span>{emailItem.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfoCard>

        {/* Phone Section */}
        <InfoCard 
          title="Phone Numbers" 
          showAddButton={true}
          onAddClick={() => {
            // TODO: Implement add phone functionality
            console.log('Add phone');
          }}
        >
          {phone.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No phone numbers</p>
          ) : (
            <div className="space-y-3">
              {phone.map((phoneItem: PhoneType) => (
                <div
                  key={phoneItem.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {phoneItem.number}
                        {phoneItem.extension && ` ext. ${phoneItem.extension}`}
                      </span>
                      {phoneItem.isPrimary && (
                        <Badge variant="default" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{phoneItem.label}</span>
                      {phoneItem.note && (
                        <>
                          <span>•</span>
                          <span>{phoneItem.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfoCard>
      </div>

      {/* Addresses Section */}
      <InfoCard 
        title="Addresses" 
        showAddButton={true}
        onAddClick={() => {
          // TODO: Implement add address functionality
          console.log('Add address');
        }}
      >
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No addresses</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address: Address) => (
              <Card
                key={address.id}
                className="border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {address.label}
                        </span>
                        {address.isPrimary && (
                          <Badge variant="default" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <p>{address.address}</p>
                        <p>
                          {address.city}, {address.province} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </InfoCard>
    </div>
  );
}

