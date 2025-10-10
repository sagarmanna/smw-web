
// StudentDetailClient.tsx - Detail Page with Tabs
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings, SlashIcon, Edit, ChevronDown, Plus, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { getStudentById, StudentDetail } from "./students.api";
import { EvaluationModal, EvaluationFormData } from "../students/components/EvaluationModal";

interface StudentDetailClientProps {
  location: string;
  studentId: string;
}

export function StudentDetailClient({ location, studentId }: StudentDetailClientProps) {
  const router = useRouter();
  const [student, setStudent] = React.useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await getStudentById(location, studentId);
        if (result.success) {
          setStudent(result.data);
        } else {
          setError(result.message || "Failed to fetch student");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [location, studentId]);

  const handleSaveEvaluation = (data: EvaluationFormData) => {
    console.log("Saving evaluation:", data);
    // Here you would typically make an API call to save the evaluation
    // Then refresh the student data
    // For now, we'll just log it
  };

  const handlePrintEvaluations = () => {
    // Create a printable version of evaluations
    const printWindow = window.open('', '_blank');
    if (printWindow && student) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Evaluations - ${student.firstName} ${student.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f4f4f4; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Evaluations - ${student.firstName} ${student.lastName}</h1>
            <p><strong>Student ID:</strong> ${student.id}</p>
            <p><strong>Customer:</strong> ${student.customer}</p>
            <p><strong>Phone:</strong> ${student.phone}</p>
            <table>
              <thead>
                <tr>
                  <th>Exam Date</th>
                  <th>Mark</th>
                  <th>Level</th>
                  <th>Program</th>
                  <th>Type</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                ${student.evaluations.map(evaluation => `
                  <tr>
                    <td>${evaluation.examDate}</td>
                    <td>${evaluation.mark}</td>
                    <td>${evaluation.level}</td>
                    <td>${evaluation.program}</td>
                    <td>${evaluation.type}</td>
                    <td>${evaluation.teacher}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading student..." className="text-center" />
      </div>
    );
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  const enrolmentColumns = [
    { accessorKey: "program", header: "Program" },
    { accessorKey: "teacher", header: "Teacher" },
    { accessorKey: "day", header: "Day" },
    { accessorKey: "fromTime", header: "From Time" },
    { accessorKey: "duration", header: "Duration" },
    { accessorKey: "startDate", header: "Start Date" },
    { accessorKey: "endDate", header: "End Date" },
  ];

  const evaluationColumns = [
    { accessorKey: "examDate", header: "Exam Date" },
    { accessorKey: "mark", header: "Mark" },
    { accessorKey: "level", header: "Level" },
    { accessorKey: "program", header: "Program" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "teacher", header: "Teacher" },
  ];

  const privateLessonColumns = [
    { accessorKey: "dueDate", header: "Due Date" },
    { accessorKey: "programName", header: "Program Name" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "duration", header: "Duration" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "price", header: "Price", cell: ({ row }: { row: { original: { price: number } } }) => `$${row.original.price.toFixed(2)}` },
    { accessorKey: "owing", header: "Owing", cell: ({ row }: { row: { original: { owing: number } } }) => `$${row.original.owing.toFixed(2)}` },
    { accessorKey: "online", header: "Online" },
  ];

  const groupLessonColumns = [
    { accessorKey: "program", header: "Program" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "duration", header: "Duration" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "attendance", header: "Attendance" },
  ];

  const absentLessonColumns = [
    { accessorKey: "program", header: "Program" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "reason", header: "Reason" },
    { accessorKey: "notifiedDate", header: "Notified Date" },
  ];

  const unscheduledLessonColumns = [
    { accessorKey: "program", header: "Program" },
    { accessorKey: "lessonsRemaining", header: "Lessons Remaining" },
    { accessorKey: "expiryDate", header: "Expiry Date" },
  ];

  const commentColumns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "author", header: "Author" },
    { accessorKey: "comment", header: "Comment" },
  ];

  const historyColumns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "details", header: "Details" },
    { accessorKey: "performedBy", header: "Performed By" },
  ];

  return (
    <div className="space-y-4 bg-white px-2 sm:px-3">
      {/* Breadcrumb header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md px-2 sm:px-3 py-2">
        <Breadcrumb>
          <BreadcrumbList className="text-xs sm:text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); router.push(`/${location}/students`); }}>Students</BreadcrumbLink>
            </BreadcrumbItem>
            <SlashIcon className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[70vw] sm:max-w-none">
                {student.firstName} {student.lastName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-8 sm:w-8" aria-label="Student actions">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Edit Profile')}>Edit Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Add Lesson')}>Add Lesson</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('View History')}>View History</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Send Notification')}>Send Notification</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => console.log('Delete')}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Details and Customer Cards */}
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
                  <span className="text-gray-700">{student.firstName} {student.lastName}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Birthday</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">{student.birthday}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Age</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">{student.age}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Gender</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">{student.gender}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Status</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">{student.status}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Customer</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Customer</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">{student.customer}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center w-full max-w-sm">
                <div className="w-40 text-right pr-4">
                  <span className="font-semibold text-gray-900">Phone</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">{student.phone}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolments Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Enrolments</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <CustomTable
            data={student.enrolments}
            columns={enrolmentColumns}
            enableSearch={false}
            enableExport={false}
            enableFilter={false}
            enablePrint={false}
            enableSorting={false}
            enableRowsPerPage={false}
          />
        </CardContent>
      </Card>

      {/* Evaluations Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Evaluations</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handlePrintEvaluations}
              disabled={student.evaluations.length === 0}
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsEvaluationModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {student.evaluations.length > 0 ? (
            <CustomTable
              data={student.evaluations}
              columns={evaluationColumns}
              enableSearch={false}
              enableExport={false}
              enableFilter={false}
              enablePrint={false}
              enableSorting={false}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No evaluations found.</p>
          )}
        </CardContent>
      </Card>

      {/* Lessons Card with Tabs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Lessons</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" style={{ zIndex: 10 }}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="private" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-4">
              <TabsTrigger value="private">Private Lessons</TabsTrigger>
              <TabsTrigger value="group">Group Lessons</TabsTrigger>
              <TabsTrigger value="absent">Absent Lessons</TabsTrigger>
              <TabsTrigger value="unscheduled">Unscheduled Lessons</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="private" className="mt-0">
              <CustomTable
                data={student.privateLessons}
                columns={privateLessonColumns}
                enableSearch={false}
                enableExport={true}
                enableFilter={false}
                enablePrint={false}
                enableRowsPerPage={false}
                enableSorting={false}
              />
            </TabsContent>

            <TabsContent value="group" className="mt-0">
              <CustomTable
                data={student.groupLessons}
                columns={groupLessonColumns}
                enableSearch={false}
                enableExport={true}
                enableFilter={false}
                enablePrint={false}
                enableRowsPerPage={false}
                enableSorting={false}
              />
            </TabsContent>

            <TabsContent value="absent" className="mt-0">
              <CustomTable
                data={student.absentLessons}
                columns={absentLessonColumns}
                enableSearch={false}
                enableExport={true}
                enableFilter={false}
                enablePrint={false}
                enableRowsPerPage={false}
                enableSorting={false}
              />
            </TabsContent>

            <TabsContent value="unscheduled" className="mt-0">
              <CustomTable
                data={student.unscheduledLessons}
                columns={unscheduledLessonColumns}
                enableSearch={false}
                enableExport={false}
                enableFilter={false}
                enablePrint={false}
                enableRowsPerPage={false}
                enableSorting={false}
              />
            </TabsContent>

            <TabsContent value="comments" className="mt-0">
              <CustomTable
                data={student.comments}
                columns={commentColumns}
                enableSearch={false}
                enableExport={false}
                enableFilter={false}
                enablePrint={false}
                enableRowsPerPage={false}
                enableSorting={false}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <CustomTable
                data={student.history}
                columns={historyColumns}
                enableSearch={false}
                enableExport={false}
                enableFilter={false}
                enablePrint={false}
                enableRowsPerPage={false}
                enableSorting={false}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Evaluation Modal */}
      <EvaluationModal
        open={isEvaluationModalOpen}
        onOpenChange={setIsEvaluationModalOpen}
        onSave={handleSaveEvaluation}
        studentName={`${student.firstName} ${student.lastName}`}
      />

      {error && <div className="text-sm text-red-600 px-2">{error}</div>}
    </div>
  );
}