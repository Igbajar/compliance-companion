import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const capaFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  type: z.enum(["Corrective", "Preventive"], { required_error: "Please select a type" }),
  source: z.string().max(50, "Source must be less than 50 characters").optional(),
  sourceType: z.enum(["Nonconformity", "Audit Finding", "Risk Assessment", "Customer Complaint", "Management Review", "Other"], { required_error: "Please select a source type" }),
  priority: z.enum(["Critical", "High", "Medium", "Low"], { required_error: "Please select a priority" }),
  owner: z.string().max(100, "Owner name must be less than 100 characters").optional(),
  department: z.string().max(50, "Department must be less than 50 characters").optional(),
  dueDate: z.date({ required_error: "Due date is required" }),
  rootCause: z.string().max(500, "Root cause must be less than 500 characters").optional(),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  verificationRequired: z.boolean().default(true),
});

export type CAPAFormValues = z.infer<typeof capaFormSchema>;

interface CAPAFormProps {
  defaultValues?: Partial<CAPAFormValues>;
  onSubmit: (data: CAPAFormValues) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export default function CAPAForm({ 
  defaultValues, 
  onSubmit, 
  onCancel, 
  isEditing = false,
  isSubmitting = false,
}: CAPAFormProps) {
  const form = useForm<CAPAFormValues>({
    resolver: zodResolver(capaFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      type: defaultValues?.type,
      source: defaultValues?.source || "",
      sourceType: defaultValues?.sourceType,
      priority: defaultValues?.priority,
      owner: defaultValues?.owner || "",
      department: defaultValues?.department || "",
      dueDate: defaultValues?.dueDate,
      rootCause: defaultValues?.rootCause || "",
      description: defaultValues?.description || "",
      verificationRequired: defaultValues?.verificationRequired ?? true,
    },
  });

  const handleSubmit = (data: CAPAFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>CAPA Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Brief description of the corrective/preventive action" 
                    className="bg-secondary/50 border-border"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Action Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Corrective">Corrective Action</SelectItem>
                    <SelectItem value="Preventive">Preventive Action</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Corrective fixes existing issues, Preventive prevents potential issues</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Source */}
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Reference</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., NC-2024-015, Audit-2024-003" 
                    className="bg-secondary/50 border-border"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Source Type */}
          <FormField
            control={form.control}
            name="sourceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select source type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Nonconformity">Nonconformity</SelectItem>
                    <SelectItem value="Audit Finding">Audit Finding</SelectItem>
                    <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
                    <SelectItem value="Customer Complaint">Customer Complaint</SelectItem>
                    <SelectItem value="Management Review">Management Review</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Department */}
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Quality, Production, Maintenance" 
                    className="bg-secondary/50 border-border"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Due Date */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-secondary/50 border-border",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a due date</span>
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Verification Required */}
          <FormField
            control={form.control}
            name="verificationRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Required</FormLabel>
                <Select onValueChange={(v) => field.onChange(v === "true")} value={field.value ? "true" : "false"}>
                  <FormControl>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Yes - Requires effectiveness verification</SelectItem>
                    <SelectItem value="false">No - Direct closure allowed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Root Cause */}
          <FormField
            control={form.control}
            name="rootCause"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Root Cause Analysis</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the identified root cause of the issue" 
                    className="bg-secondary/50 border-border min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Action Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detailed description of the corrective/preventive action to be taken" 
                    className="bg-secondary/50 border-border min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update CAPA" : "Create CAPA"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
