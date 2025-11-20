import React from "react";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCardDataRow } from "../types";

interface SectionCardContentProps {
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  data?: SectionCardDataRow[] | React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const isDataRowArray = (
  data: SectionCardContentProps["data"]
): data is SectionCardDataRow[] => {
  return Array.isArray(data);
};

export function SectionCardContent({
  isLoading = false,
  emptyState,
  data,
  children,
  footer,
}: SectionCardContentProps) {
  const shouldRenderEmptyState =
    !isLoading &&
    !children &&
    (data === undefined ||
      (isDataRowArray(data) && data.length === 0) ||
      (React.isValidElement(data) && data === null));

  return (
    <CardContent className="pt-0">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ) : shouldRenderEmptyState ? (
        <div className="py-4 text-sm text-muted-foreground">
          {emptyState ?? "No information available."}
        </div>
      ) : (
        <>
          {isDataRowArray(data) ? (
            <div className="flex justify-center">
              <dl className="text-sm">
                {data.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center py-2.5 mb-2 last:mb-0"
                  >
                    <dt className="text-sm font-semibold text-foreground min-w-[120px] text-right pr-6">
                      {item.label}
                    </dt>
                    <dd className="text-sm text-foreground">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            data ?? children
          )}
        </>
      )}
      {footer && <div className="mt-4">{footer}</div>}
    </CardContent>
  );
}

