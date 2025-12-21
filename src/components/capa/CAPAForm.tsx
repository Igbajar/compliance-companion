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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Upload, X, FileText, Image, File } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const capaFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  type: z.enum(["Corrective", "Preventive"], { required_error: "Please select a type" }),
  source: z.string().min(1, "Source reference is required").max(50, "Source must be less than 50 characters"),
  sourceType: z.enum(["Nonconformity", "Audit Finding", "Risk Assessment", "Customer Complaint", "Management Review", "Other"], { required_error: "Please select a source type" }),
  priority: z.enum(["High", "Medium", "Low"], { required_error: "Please select a priority" }),
  owner: z.string().min(2, "Owner name is required").max(100, "Owner name must be less than 100 characters"),
  department: z.string().min(1, "Department is required").max(50, "Department must be less than 50 characters"),
  dueDate: z.date({ required_error: "Due date is required" }),
  rootCause: z.string().min(10, "Root cause must be at least 10 characters").max(500, "Root cause must be less than 500 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description must be less than 2000 characters"),
  verificationRequired: z.boolean().default(true),
});

export type CAPAFormValues = z.infer<typeof capaFormSchema>;

interface Evidence {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface CAPAFormProps {
  defaultValues?: Partial<CAPAFormValues>;
  existingEvidence?: Evidence[];
  onSubmit: (data: CAPAFormValues, evidence: Evidence[]) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return <Image className="h-4 w-4 text-primary" />;
  if (type.includes("pdf")) return <FileText className="h-4 w-4 text-destructive" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function CAPAForm({ 
  defaultValues, 
  existingEvidence = [], 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: CAPAFormProps) {
  const [evidence, setEvidence] = useState<Evidence[]>(existingEvidence);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    
    const newEvidence: Evidence[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit`,
          variant: "destructive",
        });
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return;
      }
      
      newEvidence.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      });
    });
    
    if (newEvidence.length > 0) {
      setEvidence((prev) => [...prev, ...newEvidence]);
      toast({
        title: "Files uploaded",
        description: `${newEvidence.length} file(s) added as evidence`,
      });
    }
  };

  const removeEvidence = (id: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSubmit = (data: CAPAFormValues) => {
    onSubmit(data, evidence);
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          {/* Owner */}
          <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Action Owner</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Person responsible for this action" 
                    className="bg-secondary/50 border-border"
                    {...field} 
                  />
                </FormControl>
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
                <Select onValueChange={(v) => field.onChange(v === "true")} defaultValue={field.value ? "true" : "false"}>
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
                    placeholder="Describe the identified root cause of the issue (use 5 Whys or Fishbone analysis)" 
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
                    placeholder="Detailed description of the corrective/preventive action to be taken, including specific steps and expected outcomes" 
                    className="bg-secondary/50 border-border min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Evidence Upload Section */}
        <div className="space-y-4">
          <FormLabel>Supporting Evidence</FormLabel>
          
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 bg-secondary/30"
            )}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop files here, or click to browse
            </p>
            <input
              type="file"
              id="evidence-upload"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("evidence-upload")?.click()}
            >
              Browse Files
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: JPG, PNG, GIF, PDF, DOC, DOCX (max 10MB each)
            </p>
          </div>

          {/* Uploaded Files List */}
          {evidence.length > 0 && (
            <Card className="bg-secondary/30 border-border">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  Uploaded Evidence ({evidence.length} files)
                </p>
                <div className="space-y-2">
                  {evidence.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {format(file.uploadedAt, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEvidence(file.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="gap-2">
            {isEditing ? "Update CAPA" : "Create CAPA"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
