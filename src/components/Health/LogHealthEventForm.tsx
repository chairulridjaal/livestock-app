"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, CameraIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { saveHealthEvent, HealthEventData } from "@/lib/healthService"; // Import the service

const healthEventFormSchema = z.object({
  eventType: z.string({ required_error: "Event type is required." }).min(1, "Event type is required."),
  eventDate: z.date({ required_error: "Event date is required." }),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentAdministered: z.string().optional(),
  medication: z.string().optional(),
  dosage: z.string().optional(),
  vetConsulted: z.string().optional(),
  notes: z.string().optional(),
});

type HealthEventFormValues = z.infer<typeof healthEventFormSchema>;

interface LogHealthEventFormProps {
  animalId: string;
  farmId: string;
  // onSubmit: (data: HealthEventFormValues & { animalId: string; farmId: string }) => void; // Keep if external notification is needed
  onSaveSuccess?: (eventId: string) => void; // Optional callback for success
}

export function LogHealthEventForm({ animalId, farmId, onSaveSuccess }: LogHealthEventFormProps) {
  const form = useForm<HealthEventFormValues>({
    resolver: zodResolver(healthEventFormSchema),
    defaultValues: {
      eventType: "",
      symptoms: "",
      diagnosis: "",
      treatmentAdministered: "",
      medication: "",
      dosage: "",
      vetConsulted: "",
      notes: "",
    },
  });

  async function handleSubmit(data: HealthEventFormValues) {
  const eventData: HealthEventData = {
    ...data,
    animalId,
    farmId,
    eventDate: data.eventDate,
  };

  try {

    const eventId = await saveHealthEvent(eventData);
    toast.success("Health event saved successfully!");
    form.reset();
    if (onSaveSuccess) {
      onSaveSuccess(eventId);
    }
  } catch (error) {
    console.error("Failed to save health event:", error);
    toast.error("Failed to save health event. Please try again.");
  }
}


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Illness">Illness</SelectItem>
                  <SelectItem value="Injury">Injury</SelectItem>
                  <SelectItem value="Observation">Observation</SelectItem>
                  <SelectItem value="Treatment">Treatment</SelectItem>
                  <SelectItem value="Routine Checkup">Routine Checkup</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Event Date</FormLabel>
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
                    selected={field.value}
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
          name="symptoms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symptoms</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter symptoms" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Input placeholder="Enter diagnosis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatmentAdministered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Administered</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe treatment administered" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medication"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medication</FormLabel>
              <FormControl>
                <Input placeholder="Enter medication" {...field} />
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
          name="vetConsulted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Veterinarian Consulted</FormLabel>
              <FormControl>
                <Input placeholder="Enter vet's name or clinic" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo</FormLabel>
              <FormControl>
                <div className="relative w-full max-w-xs">
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center justify-center border border-dashed border-gray-400 rounded-xl h-40 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {form.watch("photo") ? (
                      <img
                        src={URL.createObjectURL(form.watch("photo"))}
                        alt="Preview"
                        className="object-cover w-full h-full rounded-xl"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <CameraIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm">Tap to take or upload a photo</span>
                      </div>
                    )}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        field.onChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </FormControl>
              <FormMessage />
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

        <Button type="submit">Save Health Event</Button>
      </form>
    </Form>
  );
}
