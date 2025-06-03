"use client"
 
import { useNavigate } from "react-router-dom"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Timestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Animal = {
  id: string
  name: string
  type: string
  breed: string
  dob?: Timestamp
  status?: string[]
  lastUpdated: Timestamp
}

export const columns: ColumnDef<Animal>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div
        className="flex items-center justify-center space-x-2 text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>#ID</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: () => (
      <div className="text-center">Name</div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <div
        className="flex items-center justify-center space-x-2 text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Type</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
        const value = row.getValue("type") as string | undefined;
        return (
          <div className="text-center">
            {value ? value : "-"}
          </div>
        );
    },
  },
  {
    accessorKey: "breed",
    header: () => (
      <div className="text-center">Breed</div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("breed")}
      </div>
    ),
  },
  {
    accessorKey: "dob",
    header: () => (
      <div className="flex items-center justify-center space-x-2 text-center">
        <span>Date of Birth</span>
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("dob") as Timestamp | undefined;
      return (
        <div className="text-center">
          {date && date.toDate ? new Date(date.toDate()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div
        className="flex items-center justify-center space-x-2 text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Status</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
        const value = row.getValue("status") as string[] | undefined;
        return (
          <div className="text-center">
            {value?.length ? Array.isArray(value) ? value.join(", ") : "-" : "-"}
          </div>
        );
    },
  },
  {
    accessorKey: "lastUpdated",
    header: ({ column }) => (
      <div
        className="flex items-center justify-center space-x-2 text-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Last Recorded</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("lastUpdated") as Timestamp | undefined;
      return (
        <div className="text-center">
          {date && date.toDate ? new Date(date.toDate()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) : "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const animal = row.original
      const navigate = useNavigate()
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(animal.id)}
            >
              Copy animal ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
            onClick={() => navigate(`/livestock/animals/${animal.id}`)}
            >View animal detail</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
