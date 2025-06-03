import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { add, format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { db, auth } from "../../../lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timestamp } from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { addToast } from "@heroui/toast";
import { 
  Alert,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
 } from "@heroui/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AnimalHealthDashboard } from "@/components/Health/AnimalHealthDashboard"; // Corrected import path
import { LogHealthEventForm } from "@/components/Health/LogHealthEventForm"; // Corrected import path
import { LogVaccinationForm } from "@/components/Health/LogVaccinationForm"; // Corrected import path


export type Records = {
  id: string
  date: any
  weight: number
  health: string
  feed: number
  milk: number | null
  notes: string
}

export const createColumns = (navigate: ReturnType<typeof useNavigate>, animalId: string): ColumnDef<Records>[] => [
  {
    accessorKey: "index",
    header: "#",
    cell: ({ row }) => {
      return row.index + 1; // Display row index starting from 1
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <div
        className="flex items-center justify-center space-x-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Date</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("date");
      return (
        <div className="text-center">
          {date instanceof Timestamp ? format(date.toDate(), "PPP") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <div
        className="flex items-center justify-center space-x-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Weight</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ row }) => {
      const weight = row.getValue("weight");
      return (
        <div className="text-center">
          {weight as number} kg
        </div>
      );
    },
  },
  {
    accessorKey: "feed",
    header: () => (
      <div className="flex items-center justify-center space-x-2">
        <span>Feed</span>
      </div>
    ),
    cell: ({ row }) => {
      const feed = row.getValue("feed");
      return (
        <div className="text-center">
          {feed ? `${feed} kg` : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "milk",
    header: () => (
      <div className="flex items-center justify-center space-x-2">
        <span>Milk</span>
      </div>
    ),
    cell: ({ row }) => {
      const milk = row.getValue("milk");
      return (
        <div className="text-center">
          {milk ? `${milk} L` : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "health",
    header: () => (
      <div className="flex items-center justify-center space-x-2">
        <span>Health</span>
      </div>
    ),
    cell: ({ row }) => {
      const health: string | undefined = row.getValue("health");
      return (
        <div className="text-center">
          {health ? health : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: function ActionsCell({ row }) {
      // Use a React component to allow hooks
      const recordId =
        row.original.id ||
        (row.getValue("date") instanceof Timestamp
          ? format((row.getValue("date") as Timestamp).toDate(), "yyyy-MM-dd")
          : row.getValue("date") as string);

      const [isOpen, setIsOpen] = React.useState(false);

      const handleDeleteRecord = async (recordId: string) => {
        const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
        const farmId = farmData.data()?.currentFarm;

        const recordDocRef = doc(db, "farms", farmId, "animals", animalId, "records", recordId);
        await deleteDoc(recordDocRef);
        addToast({
          title: "Record Deleted",
          description: `Record ${recordId} has been deleted successfully.`,
          color: "success",
        });
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/livestock/animals/${animalId}/${recordId}`)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsOpen(true)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Modal backdrop="opaque" isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                  <ModalBody>
                    <p>
                      Are you sure you want to delete <strong>{recordId}</strong>?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone.
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      className="text-red-600 hover:text-red-600"
                      variant="ghost"
                      onClick={() => {
                        handleDeleteRecord(recordId);
                        onClose();
                      }}
                    >
                      Yes, Delete
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      );
    },
  },
];

export function RecordsTable({ data, animalId, navigate }: { data: Records[]; animalId: string; navigate: ReturnType<typeof useNavigate> }) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns: createColumns(navigate, animalId),
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

const EditAnimal = () => {
  const { animalId } = useParams(); // URL param
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [dob, setDob] = useState<Timestamp | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [breeds, setBreeds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false); // State for modal open/close
  const [healthDashboardKey, setHealthDashboardKey] = useState(0);
  const [currentFarmId, setCurrentFarmId] = useState<string | null>(null);

  const refreshHealthDashboard = () => setHealthDashboardKey(prevKey => prevKey + 1);

  useEffect(() => {
    const fetchAnimalData = async () => {
      if (!animalId) {
        console.error("Cow ID is missing from URL params");
        return;
      }

      try {
        const userData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
        const farmId = userData.data()?.currentFarm;
        setCurrentFarmId(farmId); // Set currentFarmId state

        // Fetch breeds from Firestore (farm/information/breeds collection)
        const breedsCollection = collection(db, "farms", farmId, "meta", "information", "breeds");
        const breedsSnapshot = await getDocs(breedsCollection);
        const breedList = breedsSnapshot.docs.map(doc => doc.data().name); // Assuming breed name is stored in the "name" field
        setBreeds(breedList); // Set the breeds state

        // Fetch the animal data
        const animalDocRef = doc(db, "farms", farmId, "animals", animalId);
        const animalDocSnap = await getDoc(animalDocRef);

        if (animalDocSnap.exists()) {
          const animalData = animalDocSnap.data();
          setName(animalData?.name || "");
          setBreed(animalData?.breed || "");
          setDob(animalData?.dob || "");
          setNotes(animalData?.notes || "");
          setType(animalData?.type || "");
          setStatus(animalData?.status || "");
        } else {
          console.error("No such animal document found!");
        }

        const recordsRef = collection(db, "farms", farmId, "animals", animalId, "records");
        const recordsQuery = query(recordsRef, orderBy("date", "desc"));
        const recordsSnapshot = await getDocs(recordsQuery);
        const recordsData = recordsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setRecords(recordsData);

      } catch (error) {
        console.error("Error fetching animal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimalData();
  }, [animalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !breed || !dob) {
      return (
        <Alert color="warning" title="Missing Fields" description="Please fill in all required fields." />
      );
    }

    try {
      const farmData = await getDoc(doc(db, "users", auth.currentUser?.uid as string));
      const farmId = farmData.data()?.currentFarm;
      const animalDocRef = doc(db, "farms", farmId, "animals", animalId as string);
      await updateDoc(animalDocRef, {
        name,
        breed,
        status,
        dob,
        notes,
        type,
      });

      addToast({
        title: "Animal Updated",
        description: `Animal ${name} has been updated successfully.`,
        color: "success",
      });
      navigate("/livestock/animals/" + animalId);
    } catch (error) {
      console.error("Error updating animal:", error);
      addToast({
        title: "Error",
        description: "Failed to update animal.",
        color: "danger",
      });
    }
  };

  const handleDelete = async () => {  
    try {
      // Delete all records of the animal
      const recordsRef = collection(db, "animals", animalId as string, "records");
      const recordsSnapshot = await getDocs(recordsRef);
  
      for (const recordDoc of recordsSnapshot.docs) {
        await deleteDoc(doc(db, "animals", animalId as string, "records", recordDoc.id));
      }
  
      // Delete the animal document
      await deleteDoc(doc(db, "animals", animalId as string));
  
      addToast({
        title: "Animal Deleted",
        description: `Animal ${name} and all its records have been deleted successfully.`,
        color: "success",
      });
  
      navigate("/livestock/list");
    } catch (error) {
      console.error("Error deleting animal:", error);
      addToast({
        title: "Error",
        description: "Failed to delete animal.",
        color: "danger",
      });
    }
  };  

  return (
    <div className="container mx-auto p-2">
      <div className="flex flex-col lg:flex-row lg:space-x-6 mt-6">
        <Card className="lg:w-1/3">
          <CardHeader>
            <CardTitle>Edit Animal Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4 rounded-full border-2 border-gray-300">
              <img
                src="/happy-cow.webp"
                alt="Animal"
                className="w-32 h-32"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Animal Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="breed">Breed</Label>
                <Select value={breed} onValueChange={setBreed}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Breed" />
                  </SelectTrigger>
                  <SelectContent>
                    {breeds.map((breedOption, index) => (
                      <SelectItem key={index} value={breedOption}>
                        {breedOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              <div>
                <Label htmlFor="breed">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dairy Cattle">
                      <span className="text-sm">Dairy Cattle</span>
                    </SelectItem>
                    <SelectItem value="Beef Cattle">
                      <span className="text-sm">Beef Cattle</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dob"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dob ? (
                        isNaN(dob instanceof Timestamp ? dob.toDate().getTime() : new Date(dob).getTime()) ? (
                          <span>Invalid Date</span>
                        ) : (
                          format(dob instanceof Timestamp ? dob.toDate() : new Date(dob), "PPP")
                        )
                      ) : (
                        <span>Date of Birth</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dob ? new Date(dob instanceof Timestamp ? dob.toDate() : dob) : undefined}
                      onSelect={(day) => setDob(day ? Timestamp.fromDate(new Date(day)) : null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Healthy">
                      <span className="text-sm">Healthy</span>
                    </SelectItem>
                    <SelectItem value="Sick">
                      <span className="text-sm">Sick</span>
                    </SelectItem>
                    <SelectItem value="Injured">
                      <span className="text-sm">Injured</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Animal
                </Button>

                <Modal backdrop="opaque" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                      <ModalBody>
                        <p>
                        Are you sure you want to delete <strong>{name} / {animalId} </strong> and all of its records?
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This action cannot be undone.
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <Button variant="secondary" onClick={onClose}>
                          Cancel
                        </Button>
                        <Button className="text-red-600 hover:text-red-600" variant="ghost" onClick={() => { handleDelete(); onClose(); }}>
                          Yes, Delete
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="flex-1/2 lg:w-2/3 mt-6 lg:mt-0">
          <CardHeader>
            <CardTitle>Animal Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general_records">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general_records">General Records</TabsTrigger>
                <TabsTrigger value="detailed_health">Health & Vaccinations</TabsTrigger>
              </TabsList>
              <TabsContent value="general_records">
                {loading ? (
                  <div>Loading general records...</div>
                ) : (
                  <div className="overflow-x-auto mt-4">
                    <RecordsTable data={records} animalId={animalId as string} navigate={navigate} />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="detailed_health">
                {animalId && currentFarmId ? (
                  <>
                    <div className="mt-4 mb-4 flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Log New Health Event</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle>Log New Health Event</DialogTitle>
                            <DialogDescription>Record a new health observation, illness, or treatment.</DialogDescription>
                          </DialogHeader>
                          <LogHealthEventForm
                            animalId={animalId}
                            farmId={currentFarmId}
                            onSaveSuccess={() => {
                              refreshHealthDashboard();
                              // Consider adding a DialogClose mechanism or ensuring form can close itself.
                              // For now, assuming user clicks outside or form handles it.
                            }}
                          />
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Log New Vaccination</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle>Log New Vaccination Record</DialogTitle>
                            <DialogDescription>Record a new vaccination administered to the animal.</DialogDescription>
                          </DialogHeader>
                          <LogVaccinationForm
                            animalId={animalId}
                            farmId={currentFarmId}
                            onSaveSuccess={() => {
                              refreshHealthDashboard();
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <AnimalHealthDashboard
                      animalId={animalId}
                      farmId={currentFarmId}
                      key={healthDashboardKey}
                    />
                  </>
                ) : (
                  <div className="mt-4">Loading animal data or missing ID...</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditAnimal;
