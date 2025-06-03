"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { saveVaccinationRecord, VaccinationRecordData } from "@/lib/healthService"; // Import the service

const vaccinationFormSchema = z.object({
  vaccineName: z.string({ required_error: "Vaccine name is required." }).min(1, "Vaccine name is required."),
  vaccinationDate: z.date({ required_error: "Vaccination date is required." }),
  administeredBy: z.string().optional(),
  batchNumber: z.string().optional(),
  dosage: z.string().optional(),
  nextDueDate: z.date().optional().nullable(),
  isBooster: z.boolean(),
  notes: z.string().optional(),
});

type VaccinationFormValues = z.infer<typeof vaccinationFormSchema>;

interface LogVaccinationFormProps {
  animalId: string;
  farmId: string;
  // onSubmit: (data: VaccinationFormValues & { animalId: string; farmId: string }) => void; // Keep if external notification is needed
  onSaveSuccess?: (recordId: string) => void; // Optional callback for success
}

export function LogVaccinationForm({ animalId, farmId, onSaveSuccess }: LogVaccinationFormProps) {
  const form = useForm<VaccinationFormValues>({
    resolver: zodResolver(vaccinationFormSchema),
    defaultValues: {
      vaccineName: "",
      administeredBy: "",
      batchNumber: "",
      dosage: "",
      nextDueDate: null, // Ensure this aligns with Zod schema (optional, nullable)
      isBooster: false,
      notes: "",
    },
  });

  async function handleSubmit(data: VaccinationFormValues) {
    const recordData: VaccinationRecordData = {
      ...data,
      animalId,
      farmId,
      vaccinationDate: data.vaccinationDate, // Already a Date object
      nextDueDate: data.nextDueDate ? data.nextDueDate : null, // Ensure it's null if not provided
    };

    try {
      const recordId = await saveVaccinationRecord(recordData);
      toast.success("Vaccination record saved successfully!");
      form.reset(); 
      if (onSaveSuccess) {
        onSaveSuccess(recordId);
      }
    } catch (error) {
      console.error("Failed to save vaccination record:", error);
      toast.error("Failed to save vaccination record. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="vaccineName"
          render={({ field }) => (
        <FormItem>
          <FormLabel>Vaccine Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter vaccine name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vaccinationDate"
          render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Vaccination Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
            "w-[240px] pl-3 text-left font-normal",
            !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
            format(field.value, "PPP")
              ) : (
            <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value ?? undefined}
            onSelect={field.onChange}
            initialFocus
          />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="administeredBy"
          render={({ field }) => (
        <FormItem>
          <FormLabel>Administered By</FormLabel>
          <FormControl>
            <Input placeholder="Enter who administered the vaccine" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="batchNumber"
          render={({ field }) => (
        <FormItem>
          <FormLabel>Batch Number</FormLabel>
          <FormControl>
            <Input placeholder="Enter batch number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage</FormLabel>
              <FormControl>
                <Input placeholder="Enter dosage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextDueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Next Due Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isBooster"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-1">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Is this a booster?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Vaccination Record</Button>
      </form>
    </Form>
  );
}
