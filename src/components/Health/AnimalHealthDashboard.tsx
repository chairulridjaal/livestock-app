"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isPast, isFuture, differenceInDays, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge"; // Import Badge component

import React, { useState, useEffect } from "react";
import {
  getHealthEvents,
  getVaccinationRecords,
  HealthEvent, // Assuming these are exported from healthService or a types file
  VaccinationRecord, // Assuming these are exported from healthService or a types file
} from "@/lib/healthService";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For error state
import { Terminal } from "lucide-react"; // Icon for error alert


// Define interfaces for the data types based on previous forms/schemas
// These might be imported from a central types file in a real app
// Already imported from healthService

interface AnimalHealthDashboardProps {
  animalId: string;
  farmId: string;
  // healthEvents and vaccinationRecords will be fetched internally
}

const formatDate = (date: Date | string | null | undefined | { seconds: number; nanoseconds: number }): string => {
  if (!date) return "N/A";
  if (typeof date === 'string') {
    return format(new Date(date), "MMM dd, yyyy");
  }
  if (date instanceof Date) {
    return format(date, "MMM dd, yyyy");
  }
  // Check if it's a Firestore Timestamp-like object
  if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
    return format(new Date(date.seconds * 1000 + date.nanoseconds / 1000000), "MMM dd, yyyy");
  }
  return "Invalid Date";
};

const convertToDate = (date: Date | string | null | undefined | { seconds: number; nanoseconds: number }): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
    return new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
  }
  return null;
}

export function AnimalHealthDashboard({
  animalId,
  farmId,
}: AnimalHealthDashboardProps) {
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("health-events"); // To refresh data on tab change if needed, or on demand

  useEffect(() => {
    async function fetchData() {
      if (!animalId || !farmId) {
        setLoading(false);
        setError("Animal ID or Farm ID is missing.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [fetchedHealthEvents, fetchedVaccinationRecords] = await Promise.all([
          getHealthEvents(animalId, farmId),
          getVaccinationRecords(animalId, farmId),
        ]);
        setHealthEvents(fetchedHealthEvents);
        setVaccinationRecords(fetchedVaccinationRecords);
      } catch (err) {
        console.error("Error fetching health data:", err);
        setError("Failed to load health data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [animalId, farmId, activeTab]); // Re-fetch if animalId, farmId, or activeTab changes (e.g., manual refresh)

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" /> {/* Tab List Skeleton */}
        <Skeleton className="h-64 w-full" /> {/* Tab Content Skeleton */}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="health-events" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="health-events">Health Events</TabsTrigger>
          <TabsTrigger value="vaccination-records">Vaccination Records</TabsTrigger>
        </TabsList>

        <TabsContent value="health-events">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">Symptoms</TableHead>
                  <TableHead className="hidden md:table-cell">Diagnosis</TableHead>
                  <TableHead className="hidden lg:table-cell">Treatment</TableHead>
                  <TableHead className="hidden lg:table-cell">Medication</TableHead>
                  <TableHead className="hidden xl:table-cell">Vet Consulted</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthEvents.length > 0 ? (
                  healthEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.eventType || "N/A"}</TableCell>
                      <TableCell>{formatDate(event.eventDate)}</TableCell>
                      <TableCell className="hidden md:table-cell">{event.symptoms || "N/A"}</TableCell>
                      <TableCell className="hidden md:table-cell">{event.diagnosis || "N/A"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{event.treatmentAdministered || "N/A"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{event.medication || "N/A"}</TableCell>
                      <TableCell className="hidden xl:table-cell">{event.vetConsulted || "N/A"}</TableCell>
                      <TableCell>{event.notes || "N/A"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center"> {/* Adjusted colSpan based on visible columns */}
                      No health events recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="vaccination-records">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vaccine Name</TableHead>
                  <TableHead>Vaccination Date</TableHead>
                  <TableHead className="hidden md:table-cell">Administered By</TableHead>
                  <TableHead className="hidden lg:table-cell">Batch #</TableHead>
                  <TableHead className="hidden lg:table-cell">Dosage</TableHead>
                  <TableHead>Next Due Date</TableHead>
                  <TableHead>Due Status</TableHead> {/* New Column */}
                  <TableHead>Booster</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaccinationRecords.length > 0 ? (
                  vaccinationRecords.map((record) => {
                    const nextDueDate = convertToDate(record.nextDueDate);
                    let dueStatusBadge = null;
                    if (nextDueDate) {
                      const today = new Date();
                      const thirtyDaysFromNow = addDays(today, 30);
                      const daysDiff = differenceInDays(nextDueDate, today);

                      if (isPast(nextDueDate) && !isPast(addDays(nextDueDate,1))) { // Check if it's past but not more than a day to avoid confusion with "today"
                         // If due date was yesterday or before
                        if (daysDiff < -1) {
                           dueStatusBadge = <Badge variant="destructive">Overdue ({Math.abs(daysDiff)} days)</Badge>;
                        } else if (daysDiff === -1) {
                           dueStatusBadge = <Badge variant="destructive">Overdue (Yesterday)</Badge>;
                        } else { // Due today or very recently past
                           dueStatusBadge = <Badge variant="destructive">Overdue</Badge>;
                        }
                      } else if (isFuture(nextDueDate) && nextDueDate <= thirtyDaysFromNow) {
                        if (daysDiff === 0) {
                           dueStatusBadge = <Badge variant="outline" className="border-yellow-500 text-yellow-600">Due Today</Badge>;
                        } else {
                           dueStatusBadge = <Badge variant="outline" className="border-yellow-500 text-yellow-600">Upcoming ({daysDiff + 1} days)</Badge>;
                        }
                      }
                    }

                    return (
                      <TableRow key={record.id}>
                        <TableCell>{record.vaccineName || "N/A"}</TableCell>
                        <TableCell>{formatDate(record.vaccinationDate)}</TableCell>
                        <TableCell className="hidden md:table-cell">{record.administeredBy || "N/A"}</TableCell>
                        <TableCell className="hidden lg:table-cell">{record.batchNumber || "N/A"}</TableCell>
                        <TableCell className="hidden lg:table-cell">{record.dosage || "N/A"}</TableCell>
                        <TableCell>{formatDate(record.nextDueDate)}</TableCell>
                        <TableCell>{dueStatusBadge || "N/A"}</TableCell> {/* Display Badge or N/A */}
                        <TableCell>{record.isBooster ? "Yes" : "No"}</TableCell>
                        <TableCell className="hidden md:table-cell">{record.notes || "N/A"}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center"> {/* Adjusted colSpan based on visible columns */}
                      No vaccination records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
