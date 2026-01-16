import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrainingRecord, TrainingCourse } from "@/hooks/useTraining";
import { useEmployees, Employee } from "@/hooks/useEmployees";
import { FileUpload } from "@/components/shared/FileUpload";

const statusOptions = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const formSchema = z.object({
  course_id: z.string().min(1, "Course is required"),
  employee_id: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "completed", "overdue"]),
  due_date: z.string().optional(),
  completed_date: z.string().optional(),
  score: z.coerce.number().min(0).max(100).optional().nullable(),
  progress: z.coerce.number().min(0).max(100).optional(),
  certificate_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<void>;
  courses: TrainingCourse[];
  defaultValues?: (TrainingRecord & { course?: TrainingCourse; employee_id?: string }) | null;
  isEditing?: boolean;
}

export default function TrainingRecordFormDialog({
  open,
  onOpenChange,
  onSubmit,
  courses,
  defaultValues,
  isEditing,
}: Props) {
  const { employees } = useEmployees();
  const [certificateUrl, setCertificateUrl] = useState(defaultValues?.certificate_url || "");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_id: defaultValues?.course_id || "",
      employee_id: (defaultValues as any)?.employee_id || "",
      status: defaultValues?.status || "not_started",
      due_date: defaultValues?.due_date?.split("T")[0] || "",
      completed_date: defaultValues?.completed_date?.split("T")[0] || "",
      score: defaultValues?.score ?? undefined,
      progress: defaultValues?.progress || 0,
      certificate_url: defaultValues?.certificate_url || "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        course_id: defaultValues.course_id || "",
        employee_id: (defaultValues as any).employee_id || "",
        status: defaultValues.status || "not_started",
        due_date: defaultValues.due_date?.split("T")[0] || "",
        completed_date: defaultValues.completed_date?.split("T")[0] || "",
        score: defaultValues.score ?? undefined,
        progress: defaultValues.progress || 0,
        certificate_url: defaultValues.certificate_url || "",
      });
      setCertificateUrl(defaultValues.certificate_url || "");
    } else {
      form.reset({
        course_id: "",
        employee_id: "",
        status: "not_started",
        due_date: "",
        completed_date: "",
        score: undefined,
        progress: 0,
        certificate_url: "",
      });
      setCertificateUrl("");
    }
  }, [defaultValues, form]);

  const handleCertificateUpload = (url: string) => {
    setCertificateUrl(url);
    form.setValue("certificate_url", url);
  };

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      score: values.score ?? null,
      certificate_url: certificateUrl,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Training Record" : "Assign Training"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary/50 border-border">
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} {emp.department ? `(${emp.department})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="course_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary/50 border-border">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary/50 border-border">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-secondary/50 border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completed_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completed Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-secondary/50 border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} className="bg-secondary/50 border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={100} 
                        {...field} 
                        value={field.value ?? ""}
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Certificate</FormLabel>
              <FileUpload
                bucket="certificates"
                folder="training"
                accept=".pdf,.jpg,.jpeg,.png"
                onUpload={handleCertificateUpload}
                existingUrl={certificateUrl}
                existingFileName={certificateUrl ? "Certificate" : undefined}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                {isEditing ? "Save Changes" : "Assign Training"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
