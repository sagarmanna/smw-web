"use client";

import Image from "next/image";
import React from "react";
import { Dancing_Script, Montserrat } from "next/font/google";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const headerSans = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const headerScript = Dancing_Script({ subsets: ["latin"], weight: ["600", "700"] });

export type AuthShellProps = {
  /** Optional centered card title (e.g. "Office Login") */
  title?: string;
  /** Main content (forms, copy, buttons, etc.) */
  children: React.ReactNode;
  /** Outer card/container width (Tailwind max-w-*) */
  containerClassName?: string;
  /** Inner content width (Tailwind max-w-*) */
  contentClassName?: string;
};

export default function AuthShell({
  title,
  children,
  containerClassName = "max-w-lg",
  contentClassName = "max-w-sm",
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-6">
      <div className={`w-full ${containerClassName}`}>
        <div className="flex items-center justify-center gap-5 mb-6">
          <div className="bg-white rounded-md p-2 shadow-sm">
            <Image
              src="/admin/v2/arcadia-master-logo.png"
              alt="Arcadia Academy of Music"
              width={96}
              height={96}
              priority
            />
          </div>
          <div className="leading-tight">
            <div className={`${headerSans.className} text-4xl font-semibold tracking-tight text-red-600`}>
              discover
            </div>
            <div className={`${headerScript.className} text-2xl text-slate-800 -mt-2`}>the magic of music</div>
          </div>
        </div>

        <Card className="shadow-md">
          {title ? (
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-2xl font-semibold text-slate-700">{title}</CardTitle>
            </CardHeader>
          ) : null}

          <CardContent className={`${title ? "pb-8" : "py-8"}`}>
            <div className={`mx-auto w-full ${contentClassName}`}>{children}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

