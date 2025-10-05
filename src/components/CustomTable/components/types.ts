export interface FilterOption<TData> {
  key: string;
  label: string;
  predicate: (row: TData) => boolean;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
}

export interface ServerSideFilterOption {
  key: string;
  label: string;
}

export interface ColumnGroup {
  label: string;
  columnKeys: string[]; // accessorKeys that belong to this group
}

export type TableSize = "compact" | "normal" | "comfortable";
export type TableVariant = "default" | "bordered" | "striped";
