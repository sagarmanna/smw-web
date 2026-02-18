"use client";

import * as React from "react";
import { Upload, Download, AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { importUsersCsv, UserImportResponse } from "@/lib/api/user.api";
import { ReportPageLayout } from "@/components/ReportPageLayout";

/** Sample CSV content – same format as required by the import API. Downloaded as a file from the browser so it always opens. */
const SAMPLE_CSV_CONTENT = `"First Name",Last Name,Date of Birth,Billing First Name,Billing Last Name,Email Address,Billing Email Address,Billing Address,Billing City,Billing Province,Billing Postal Code,Billing Country,Billing Home Tel,Billing Work Tel,Billing Work Tel Ext.,Billing Other Tel,Billing Other Tel Ext.,Address,City,Province,Postal Code,Country,Home Tel,Other Tel,Balance To Date,Comments
"Sofia",Chen,5/10/2014,Wei,Chen,wei.chen@example.com,wei.chen@example.com,88 River Rd,Mississauga,ON,L5B 2M2,Canada,647-555-0100,647-555-0101,,,,"88 River Rd",Mississauga,ON,L5B 2M2,Canada,647-555-0100,,0,Sample import - new customer 1
"Owen",Patel,11/3/2011,Priya,Patel,priya.patel@example.com,priya.patel@example.com,200 Queen St E,Toronto,ON,M5A 1A1,Canada,416-555-0200,,,,,"200 Queen St E",Toronto,ON,M5A 1A1,Canada,416-555-0200,,25,Sample import - new customer 2
`;

const SAMPLE_CSV_FILENAME = "user-import-sample.csv";

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = SAMPLE_CSV_FILENAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface UserImportClientProps {
  location: string;
}

export function UserImportClient({ location }: UserImportClientProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [result, setResult] = React.useState<UserImportResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    setFile(chosen || null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await importUsersCsv(location, file);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError((res as { message?: string }).message || "Import failed.");
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to import. Please try again.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ReportPageLayout
      title="Import Users"
      subtitle="Upload a CSV to import customers and students. Use the sample file for the correct format."
      isLoading={false}
      error={error}
      onRetry={() => setError(null)}
      actions={
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0" aria-label="How to use Import">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  How to use User Import
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 text-sm text-muted-foreground">
                <section>
                  <h4 className="font-medium text-foreground mb-1">What this does</h4>
                  <p>
                    Each row in your CSV creates one <strong>student</strong>. If the &quot;Billing Home Tel&quot; number
                    already exists for a customer in this location, we add the student to that customer. If not, we
                    create a <strong>new customer</strong> and then add the student.
                  </p>
                </section>
                <section>
                  <h4 className="font-medium text-foreground mb-1">Steps</h4>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1">
                    <li>Download the <strong>sample CSV</strong> (same format we expect).</li>
                    <li>Fill in your data. Keep the first row as header; column names must match exactly.</li>
                    <li>Choose your CSV file and click <strong>Import</strong>.</li>
                  </ol>
                </section>
                <section>
                  <h4 className="font-medium text-foreground mb-2">Columns</h4>
                  <div className="rounded-md border border-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-3 py-2 font-medium text-foreground">Column</th>
                          <th className="px-3 py-2 font-medium text-foreground w-24">Required?</th>
                          <th className="px-3 py-2 font-medium text-foreground hidden sm:table-cell">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr><td className="px-3 py-2">Billing Home Tel</td><td className="px-3 py-2"><span className="text-amber-600 dark:text-amber-400 font-medium">Yes</span></td><td className="px-3 py-2 hidden sm:table-cell">Used to find or create the customer. Rows without it are skipped.</td></tr>
                        <tr><td className="px-3 py-2">First Name, Last Name</td><td className="px-3 py-2"><span className="text-amber-600 dark:text-amber-400 font-medium">Yes</span></td><td className="px-3 py-2 hidden sm:table-cell">Student name.</td></tr>
                        <tr><td className="px-3 py-2">Billing First Name, Billing Last Name</td><td className="px-3 py-2">For new customers</td><td className="px-3 py-2 hidden sm:table-cell">Customer (e.g. parent) name.</td></tr>
                        <tr><td className="px-3 py-2">Date of Birth</td><td className="px-3 py-2">No</td><td className="px-3 py-2 hidden sm:table-cell">Format: m/d/Y (e.g. 5/10/2014).</td></tr>
                        <tr><td className="px-3 py-2">Email Address</td><td className="px-3 py-2">No</td><td className="px-3 py-2 hidden sm:table-cell">Customer email.</td></tr>
                        <tr><td className="px-3 py-2">Billing Address, Billing City, Billing Postal Code</td><td className="px-3 py-2">Recommended</td><td className="px-3 py-2 hidden sm:table-cell">For new customers.</td></tr>
                        <tr><td className="px-3 py-2">Billing Work Tel, Other Tel, Balance To Date, Comments</td><td className="px-3 py-2">No</td><td className="px-3 py-2 hidden sm:table-cell">Optional.</td></tr>
                      </tbody>
                    </table>
                  </div>
                </section>
                <section>
                  <h4 className="font-medium text-foreground mb-1">Tips</h4>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>Same <strong>Billing Home Tel</strong> in this location = same customer; we only add a new student.</li>
                    <li>New phone number = we create a new customer and one student.</li>
                    <li>Save the file as <strong>CSV (UTF-8)</strong> if you use special characters.</li>
                  </ul>
                </section>
              </div>
            </DialogContent>
          </Dialog>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
            Download sample CSV
          </button>
        </div>
      }
    >
      <div className="space-y-6 max-w-2xl">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            CSV file
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
            />
            <Button
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="shrink-0"
            >
              {uploading ? (
                <>
                  <span className="animate-pulse">Importing…</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Selected: {file.name}
            </p>
          )}
        </div>

        {result && (
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6 space-y-3">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200 font-medium">
              <CheckCircle2 className="h-5 w-5" />
              Import complete
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              {result.studentCount} students imported out of {result.totalRows}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {result.customerCount} customers created
              {result.customerCount === 0 && result.studentCount > 0 && (
                <span className="block mt-1 text-amber-700 dark:text-amber-300">
                  (All rows matched existing customers by Billing Home Tel; only students were added.)
                </span>
              )}
            </p>
            {result.errors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Row-level issues
                </p>
                <ul className="mt-2 list-disc list-inside text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  {result.errors.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </ReportPageLayout>
  );
}
