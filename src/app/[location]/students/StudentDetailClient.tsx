// StudentDetailClient.tsx - Refactored with All Reusable Components
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ReusableCard } from "@/components/TablesCards";
import { ReusableModal } from "@/components/TablesModals";
import { InfoField } from "@/components/TablesInfoField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabContent } from "@/components/TabContent";
import { getStudentById, StudentDetail } from "./students.api";
import { 
  STUDENT_TAB_CONFIGS, 
  STUDENT_TAB_ORDER,
  PrivateLessonData,
  GroupLessonData,
  AbsentLessonData,
  UnscheduledLessonData,
  CommentData,
  HistoryData
} from "./studentTabConfigs";
import { mockStudentTabData } from "./mockData/studentMockData";

interface StudentDetailClientProps {
  location: string;
  studentId: string;
}

interface EvaluationFormData {
  examDate: string;
  mark: string;
  level: string;
  program: string;
  type: string;
  teacher: string;
}

export function StudentDetailClient({ location, studentId }: StudentDetailClientProps) {
  const router = useRouter();
  const [student, setStudent] = React.useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Modal states
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = React.useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = React.useState(false);

  // Form states
  const [evaluationForm, setEvaluationForm] = React.useState<EvaluationFormData>({
    examDate: "",
    mark: "",
    level: "",
    program: "",
    type: "",
    teacher: "",
  });

  const [editProfileForm, setEditProfileForm] = React.useState({
    firstName: "",
    lastName: "",
    birthday: "",
    gender: "",
    status: "",
  });

  // Tab data states
  const [privateLessonData, setPrivateLessonData] = React.useState<PrivateLessonData[]>([]);
  const [groupLessonData, setGroupLessonData] = React.useState<GroupLessonData[]>([]);
  const [absentLessonData, setAbsentLessonData] = React.useState<AbsentLessonData[]>([]);
  const [unscheduledLessonData, setUnscheduledLessonData] = React.useState<UnscheduledLessonData[]>([]);
  const [commentData, setCommentData] = React.useState<CommentData[]>([]);
  const [historyData, setHistoryData] = React.useState<HistoryData[]>([]);
  const [showAllUnscheduled, setShowAllUnscheduled] = React.useState<boolean>(false);

  // Tab data mapping for easy access
  const tabDataMap: Record<string, unknown[]> = {
    privateLessonData,
    groupLessonData,
    absentLessonData,
    unscheduledLessonData,
    commentData,
    historyData,
  };

  React.useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const result = await getStudentById(location, studentId);
        if (result.success) {
          setStudent(result.data);
          setEditProfileForm({
            firstName: result.data?.firstName ?? "",
            lastName: result.data?.lastName ?? "",
            birthday: result.data?.birthday ?? "",
            gender: result.data?.gender ?? "",
            status: result.data?.status ?? "",
          });
        } else {
          setError(result.message || "Failed to fetch student");
        }

        // Load tab data (mock data for now)
        setPrivateLessonData(mockStudentTabData.privateLessonData);
        setGroupLessonData(mockStudentTabData.groupLessonData);
        setAbsentLessonData(mockStudentTabData.absentLessonData);
        setUnscheduledLessonData(mockStudentTabData.unscheduledLessonData);
        setCommentData(mockStudentTabData.commentData);
        setHistoryData(mockStudentTabData.historyData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [location, studentId]);

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

  const handleEditProfile = () => {
    // TODO: Implement update profile API call
    setIsEditProfileModalOpen(false);
  };

  const handleDeleteStudent = () => {
    // TODO: Implement delete student API call
    setIsDeleteModalOpen(false);
    router.push(`/${location}/students`);
  };

  const handleAddLesson = () => {
    // TODO: Implement add lesson API call
    setIsAddLessonModalOpen(false);
  };

  const handleShowMore = (_tabKey: string) => {
    // TODO: Implement show more functionality
    // This could load more data, expand the table, or navigate to a detailed view
  };

  const handleShowAllChange = (checked: boolean) => {
    setShowAllUnscheduled(checked);
    // TODO: Implement show all functionality
    // This could filter the data or show/hide certain rows
  };

  const handlePrintEvaluations = () => {
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

  const evaluationColumns = [
    { accessorKey: "examDate", header: "Exam Date" },
    { accessorKey: "mark", header: "Mark" },
    { accessorKey: "level", header: "Level" },
    { accessorKey: "program", header: "Program" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "teacher", header: "Teacher" },
  ];

  const enrolmentColumns = [
    { accessorKey: "program", header: "Program" },
    { accessorKey: "teacher", header: "Teacher" },
    { accessorKey: "day", header: "Day" },
    { accessorKey: "fromTime", header: "From Time" },
    { accessorKey: "duration", header: "Duration" },
    { accessorKey: "startDate", header: "Start Date" },
    { accessorKey: "endDate", header: "End Date" },
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
              <DropdownMenuItem onClick={() => setIsEditProfileModalOpen(true)}>Edit Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAddLessonModalOpen(true)}>Add Lesson</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {/* TODO: Implement view history */}}>View History</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {/* TODO: Implement send notification */}}>Send Notification</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => setIsDeleteModalOpen(true)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Details and Customer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Details Card */}
        <ReusableCard
          title="Details"
          actions={[
            { icon: Edit, onClick: () => setIsEditProfileModalOpen(true), label: 'Edit details' },
            { icon: ChevronDown, onClick: () => {/* TODO: Implement expand */}, label: 'Expand' },
          ]}
        >
          <div className="space-y-3">
            <InfoField label="Name" value={`${student.firstName} ${student.lastName}`} />
            <InfoField label="Birthday" value={student.birthday ?? ''} />
            <InfoField label="Age" value={student.age ?? ''} />
            <InfoField label="Gender" value={student.gender ?? ''} />
            <InfoField label="Status" value={student.status} />
          </div>
        </ReusableCard>

        {/* Customer Card */}
        <ReusableCard
          title="Customer"
          actions={[
            { icon: Plus, onClick: () => {/* TODO: Implement add */}, label: 'Add customer' },
          ]}
        >
          <div className="space-y-3">
            <InfoField label="Customer" value={student.customer} />
            <InfoField label="Phone" value={student.phone} />
          </div>
        </ReusableCard>
      </div>

      {/* Enrolments Card */}
      <ReusableCard
        title="Enrolments"
        actions={[
          { icon: ChevronDown, onClick: () => {/* TODO: Implement expand */}, label: 'Expand' },
        ]}
      >
        <CustomTable
          data={mockStudentTabData.enrolmentData}
          columns={enrolmentColumns}
          enableSearch={false}
          enableExport={false}
          enableFilter={false}
          enablePrint={false}
          enableSorting={false}
          enableRowsPerPage={false}
        />
      </ReusableCard>

      {/* Evaluations Card */}
      <ReusableCard
        title="Evaluations"
        actions={[
          { 
            icon: Printer, 
            onClick: handlePrintEvaluations, 
            label: 'Print evaluations' 
          },
          { 
            icon: Plus, 
            onClick: () => setIsEvaluationModalOpen(true), 
            label: 'Add evaluation' 
          },
        ]}
      >
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
      </ReusableCard>

      {/* Tabbed Interface */}
      <div className="mt-8">
        <Tabs defaultValue="private-lessons" className="w-full">
          <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1.5 text-muted-foreground w-full overflow-x-auto gap-1">
            {STUDENT_TAB_ORDER.map((tabKey) => (
              <TabsTrigger 
                key={tabKey} 
                value={tabKey} 
                className="whitespace-nowrap px-6 py-2 text-sm font-medium min-w-fit"
              >
                {STUDENT_TAB_CONFIGS[tabKey].title}
              </TabsTrigger>
            ))}
          </TabsList>

          {STUDENT_TAB_ORDER.map((tabKey) => {
            const config = STUDENT_TAB_CONFIGS[tabKey];
            const data = tabDataMap[config.dataKey as keyof typeof tabDataMap] || [];
            
            // Define bottom content for comments tab
            const commentsBottomContent = tabKey === "comments" ? (
              <div className="mt-4 flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Type message"
                  className="flex-grow"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : undefined;
            
            return (
              <TabsContent key={tabKey} value={tabKey} className="mt-4">
                <TabContent
                  title={config.title}
                  data={data}
                  columns={config.columns || []}
                  loading={isLoading}
                  hasAddButton={config.hasAddButton}
                  onAdd={() => {
                    if (tabKey === "private-lessons") {
                      setIsAddLessonModalOpen(true);
                    } else {
                      // TODO: Implement add functionality for other tabs
                    }
                  }}
                  emptyState={config.emptyState}
                  hasTable={config.hasTable}
                  bottomContent={commentsBottomContent}
                  showMoreButton={config.showMoreButton}
                  onShowMore={() => handleShowMore(tabKey)}
                  showAllCheckbox={config.showAllCheckbox}
                  showAllChecked={tabKey === "unscheduled-lessons" ? showAllUnscheduled : false}
                  onShowAllChange={handleShowAllChange}
                  dropdownItems={config.dropdownItems}
                  dropdownLabel={config.dropdownLabel}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Add Evaluation Modal */}
      <ReusableModal
        open={isEvaluationModalOpen}
        onOpenChange={setIsEvaluationModalOpen}
        title="Add Evaluation"
        description={`Add a new evaluation for ${student.firstName} ${student.lastName}`}
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

      {/* Edit Profile Modal */}
      <ReusableModal
        open={isEditProfileModalOpen}
        onOpenChange={setIsEditProfileModalOpen}
        title="Edit Student Profile"
        description="Update student information"
        size="lg"
        actions={[
          { 
            label: 'Cancel', 
            onClick: () => setIsEditProfileModalOpen(false), 
            variant: 'outline' 
          },
          { 
            label: 'Save Changes', 
            onClick: handleEditProfile, 
            variant: 'default' 
          },
        ]}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={editProfileForm.firstName}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={editProfileForm.lastName}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={editProfileForm.birthday}
              onChange={(e) => setEditProfileForm({ ...editProfileForm, birthday: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                type="text"
                value={editProfileForm.gender}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, gender: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                type="text"
                value={editProfileForm.status}
                onChange={(e) => setEditProfileForm({ ...editProfileForm, status: e.target.value })}
              />
            </div>
          </div>
        </div>
      </ReusableModal>

      {/* Delete Confirmation Modal */}
      <ReusableModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
        size="sm"
        actions={[
          { 
            label: 'Cancel', 
            onClick: () => setIsDeleteModalOpen(false), 
            variant: 'outline' 
          },
          { 
            label: 'Delete', 
            onClick: handleDeleteStudent, 
            variant: 'destructive' 
          },
        ]}
      >
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            You are about to delete:
          </p>
          <div className="bg-muted p-3 rounded-md">
            <p className="font-semibold">{student.firstName} {student.lastName}</p>
            <p className="text-sm text-muted-foreground">ID: {student.id}</p>
          </div>
        </div>
      </ReusableModal>

      {/* Add Lesson Modal */}
      <ReusableModal
        open={isAddLessonModalOpen}
        onOpenChange={setIsAddLessonModalOpen}
        title="Add Lesson"
        description="Schedule a new lesson for this student"
        size="lg"
        actions={[
          { 
            label: 'Cancel', 
            onClick: () => setIsAddLessonModalOpen(false), 
            variant: 'outline' 
          },
          { 
            label: 'Add Lesson', 
            onClick: handleAddLesson, 
            variant: 'default' 
          },
        ]}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lessonProgram">Program</Label>
            <Input
              id="lessonProgram"
              type="text"
              placeholder="Select program"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lessonDate">Date</Label>
              <Input
                id="lessonDate"
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonDuration">Duration (minutes)</Label>
              <Input
                id="lessonDuration"
                type="number"
                placeholder="30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lessonTeacher">Teacher</Label>
            <Input
              id="lessonTeacher"
              type="text"
              placeholder="Select teacher"
            />
          </div>
        </div>
      </ReusableModal>

      {error && <div className="text-sm text-red-600 px-2">{error}</div>}
    </div>
  );
}