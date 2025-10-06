import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnDefBase<TData, TValue> {
    size?: number;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    printable?: boolean;
    printableName?: string;
    exportFormatter?: (value: TValue) => string | number;
  }
}
