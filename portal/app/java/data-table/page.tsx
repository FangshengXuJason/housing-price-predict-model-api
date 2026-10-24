import type { Metadata } from "next";
import DataTable from "@/components/java/DataTable";

export const metadata: Metadata = {
  title: "Housing Data Table - Java Backend",
  description: "View, sort, filter, and export housing data in a table format",
};

export default function DataTablePage() {
  return <DataTable />;
}
