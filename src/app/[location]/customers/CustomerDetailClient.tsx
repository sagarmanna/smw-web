"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Settings, SlashIcon, Edit, ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { getCustomerById, CustomerRow } from "./customers.api";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { formatCurrency } from "@/utils/formatCurrency";
import { LessonsDueCard, OutstandingInvoiceCard, CreditsCard, BalanceCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerDetailClientProps {
  location: string;
  id: string;
}

export function CustomerDetailClient({ location, id }: CustomerDetailClientProps) {
  const router = useRouter();
  const [customer, setCustomer] = React.useState<CustomerRow | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getCustomerById(location, Number(id));
      setCustomer(data);
      setLoading(false);
    };
    load();
  }, [location, id]);

  return (
    <div className="space-y-4 bg-white px-2 sm:px-3">
      {/* Breadcrumb header (shadcn) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md px-2 sm:px-3 py-2">
        <Breadcrumb>
          <BreadcrumbList className="text-xs sm:text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); router.push("customers"); }}>Customers</BreadcrumbLink>
            </BreadcrumbItem>
            <SlashIcon className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[70vw] sm:max-w-none">
                {loading ? "Loading..." : customer ? `${customer.firstName} ${customer.lastName}` : id}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-8 sm:w-8" aria-label="Customer actions">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Receive Payment')}>Receive Payment</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Print Statement')}>Print Statement</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Email Statement')}>Email Statement</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('A/R Report Detail')}>A/R Report Detail</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Items Purchased by Category')}>Items Purchased by Category</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Notify Via Email')}>Notify Via Email</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => console.log('Delete')}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Payment History Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
        <LessonsDueCard 
          value={formatCurrency(821.52)} 
          loading={loading} 
        />
        <OutstandingInvoiceCard 
          value={formatCurrency(20741.84)} 
          loading={loading} 
        />
        <CreditsCard 
          value={formatCurrency(0.00)} 
          loading={loading} 
        />
        <BalanceCard 
          value={customer ? formatCurrency(customer.balance) : formatCurrency(0)} 
          loading={loading} 
        />
      </div>

      {/* Details and Email Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Details Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Details</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Name</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">
                    {loading ? "..." : customer ? `${customer.firstName} ${customer.lastName}` : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Role</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">Customer</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Referral Source</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">Drive By</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Status</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Email</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Home</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">
                    {loading ? "..." : customer ? customer.email : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Home</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">sample1@example.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}


