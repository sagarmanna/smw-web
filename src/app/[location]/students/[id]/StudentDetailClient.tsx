"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useStudentDetails } from "../hooks/useStudentDetails";
import { StudentDetailsCard } from "../components/StudentDetailsCard";
import { StudentCustomerCard } from "../components/StudentCustomerCard";
import { StudentEnrolmentsCard } from "../components/StudentEnrolmentsCard";
import { StudentEvaluationsCard } from "../components/StudentEvaluationsCard";
import { StudentTabsSection } from "../components/StudentTabsSection";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentDetailClientProps {
  location: string;
  id: string;
}

interface EvaluationFormData {
  examDate: string;
  mark: string;
  level: string;
  program: string;
  type: string;
  teacher: string;
}

export function StudentDetailClient({ location, id }: StudentDetailClientProps) {
  const router = useRouter();
  const studentId = id;

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.student.isLoading);
  const error = useAppSelector((state) => state.student.error);
  const studentInfo = useAppSelector((state) => state.student.studentInfo);

  const {
    details,
    customer,
    enrolments,
    evaluations,
    saveDetails,
    savingDetails,
  } = useStudentDetails(location, studentId);

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    if (!details) return `Student #${id}`;
    return `${details.firstName} ${details.lastName}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Students",
        onClick: () => router.push(`/${location}/students`),
      },
    ],
    [location, router]
  );

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [],
    []
  );

  // Modal states
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = React.useState(false);

  // Form states
  const [evaluationForm, setEvaluationForm] = React.useState<EvaluationFormData>({
    examDate: "",
    mark: "",
    level: "",
    program: "",
    type: "",
    teacher: "",
  });

  const handleSaveEvaluation = () => {
    // TODO: Implement save evaluation API call
    setIsEvaluationModalOpen(false);
    setEvaluationForm({
      examDate: "",
      mark: "",
      level: "",
      program: "",
      type: "",
      teacher: "",
    });
  };


  const handlePrintEvaluations = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && details) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Evaluations - ${details.firstName} ${details.lastName}</title>
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
            <h1>Evaluations - ${details.firstName} ${details.lastName}</h1>
            <p><strong>Student ID:</strong> ${details.id}</p>
            ${customer ? `<p><strong>Customer:</strong> ${customer.customer}</p>` : ''}
            ${customer ? `<p><strong>Phone:</strong> ${customer.phone}</p>` : ''}
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
                ${evaluations.map(evaluation => `
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

  // Error state - show error but still render cards with skeleton
  const showError = error && !studentInfo;

  if (isLoading && !studentInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading student..." className="text-center" />
      </div>
    );
  }

  if (!studentInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Student not found"}
          title="Unable to Load Student Details"
          fallbackMessage="An unexpected error occurred while loading the student details. Please try again later."
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-black -mt-2">
        {showError && (
          <div className="mb-4">
            <ErrorDisplay
              error={error}
              title="Unable to Load Student Details"
              fallbackMessage="An unexpected error occurred while loading the student details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Student actions"
          showProfileIcon={true}
          profileIconSize="md"
        />

        {/* Main Content - All cards share the same cached data from Redux */}
        <div className="space-y-3 sm:space-y-4 mt-4">
          {/* Top Row - Details and Customer Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <StudentDetailsCard
              details={details}
              onSaveDetails={saveDetails}
              savingDetails={savingDetails}
              isLoading={isLoading}
              location={location}
              studentId={studentId}
            />

            <StudentCustomerCard
              customer={customer?.customer || ""}
              phone={customer?.phone || ""}
              isLoading={isLoading}
            />
          </div>

          {/* Full Width Sections */}
          <StudentEnrolmentsCard
            enrolments={enrolments}
            isLoading={isLoading}
            location={location}
          />

          <StudentEvaluationsCard
            evaluations={evaluations}
            onAdd={() => setIsEvaluationModalOpen(true)}
            onPrint={handlePrintEvaluations}
            isLoading={isLoading}
          />
        </div>

        {/* Tabs Section */}
        <StudentTabsSection location={location} studentId={studentId} />
      </div>

      {/* Add Evaluation Modal */}
      <ReusableModal
        open={isEvaluationModalOpen}
        onOpenChange={setIsEvaluationModalOpen}
        title="Add Evaluation"
        description={`Add a new evaluation for ${details?.firstName || ''} ${details?.lastName || ''}`}
        size="lg"
        actions={[
          { 
            label: 'Cancel', 
            onClick: () => setIsEvaluationModalOpen(false), 
            variant: 'outline' 
          },
          { 
            label: 'Save Evaluation', 
            onClick: handleSaveEvaluation, 
            variant: 'default' 
          },
        ]}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examDate">Exam Date</Label>
              <Input
                id="examDate"
                type="date"
                value={evaluationForm.examDate}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, examDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mark">Mark</Label>
              <Input
                id="mark"
                type="text"
                placeholder="Enter mark"
                value={evaluationForm.mark}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, mark: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                type="text"
                placeholder="Enter level"
                value={evaluationForm.level}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, level: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Input
                id="program"
                type="text"
                placeholder="Enter program"
                value={evaluationForm.program}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, program: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                type="text"
                placeholder="Enter type"
                value={evaluationForm.type}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Input
                id="teacher"
                type="text"
                placeholder="Enter teacher name"
                value={evaluationForm.teacher}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, teacher: e.target.value })}
              />
            </div>
          </div>
        </div>
      </ReusableModal>

    </>
  );
}
