import React from "react";
import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Animal {
  id: string;
  name: string;
  breed: string;
  dob: any;
}

interface Record {
  date: any;
  weight: number;
  health: string;
  feed: number;
  milk: number | null;
  notes: string;
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
    accessorKey: "lastRecorded",
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
      const date = row.getValue("lastRecorded");
      return (
        <div className="text-center">
          {date === "N/A" ? "N/A" : new Date(date as string | number | Date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      const recordId = row.getValue("id");
      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = `/livestock/edit/${recordId}`}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = `/livestock/record/${recordId}`}>Record</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function AnimalListTable( { data }: { data: Animal[] }) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
  })

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const AnimalList = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [lastRecordDates, setLastRecordDates] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
        const farmId = farmData.data()?.currentFarm;
        const animalsCollection = collection(db, "farms", farmId, "animals");
        const snapshot = await getDocs(animalsCollection);
        const animalList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Animal[];
        setAnimals(animalList);

        for (let animal of animalList) {
          const recordsCollection = collection(db, "farms", farmId, "animals", animal.id, "records");
          const recordsQuery = query(recordsCollection, orderBy("date", "desc"), limit(1));
          const recordSnapshot = await getDocs(recordsQuery);
          if (!recordSnapshot.empty) {
            const lastRecord = recordSnapshot.docs[0].data() as Record;
            const lastRecordedDate = lastRecord.date.toDate().toLocaleDateString();
            setLastRecordDates((prev) => ({
              ...prev,
              [animal.id]: lastRecordedDate,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching animals: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  return (
    <div className="container mx-auto p-2">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Animal List</h1>
        <Button variant="default" onClick={() => window.location.href = "/livestock/add"}>Add Animal</Button>
      </div>
      <Card>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <AnimalListTable data={animals.map(animal => ({ ...animal, lastRecorded: lastRecordDates[animal.id] || "N/A" }))} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalList;
