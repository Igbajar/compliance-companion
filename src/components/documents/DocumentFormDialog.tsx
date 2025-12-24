import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Document } from "@/hooks/useDocuments";

const documentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  document_number: z.string().max(50, "Document number must be less than 50 characters").optional(),
  type: z.enum(["procedure", "policy", "form", "work_instruction", "manual"]),
  status: z.enum(["current", "under_review", "draft", "obsolete"]),
  version: z.string().max(20, "Version must be less than 20 characters").optional(),
  clause: z.string().max(50, "Clause must be less than 50 characters").optional(),
  content: z.string().max(10000, "Content must be less than 10000 characters").optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface DocumentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: Document | null;
  onSubmit: (values: DocumentFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const typeLabels = {
  procedure: "Procedure",
  policy: "Policy",
  form: "Form",
  work_instruction: "Work Instruction",
  manual: "Manual",
};

const statusLabels = {
  current: "Current",
  under_review: "Under Review",
  draft: "Draft",
  obsolete: "Obsolete",
};

export const DocumentFormDialog = ({
  open,
  onOpenChange,
  document,
  onSubmit,
  isSubmitting,
}: DocumentFormDialogProps) => {
  const isEditing = !!document;

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      document_number: "",
      type: "procedure",
      status: "draft",
      version: "1.0",
      clause: "",
      content: "",
    },
  });

  useEffect(() => {
    if (document) {
      form.reset({
        title: document.title,
        document_number: document.document_number || "",
        type: document.type,
        status: document.status,
        version: document.version || "1.0",
        clause: document.clause || "",
        content: document.content || "",
      });
    } else {
      form.reset({
        title: "",
        document_number: "",
        type: "procedure",
        status: "draft",
        version: "1.0",
        clause: "",
        content: "",
      });
    }
  }, [document, form]);

  const handleSubmit = async (values: DocumentFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Document" : "Create New Document"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the document details below."
              : "Fill in the details to create a new document."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., QMS-POL-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
                name="clause"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>ISO Clause</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 7.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Content / Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter document content or description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
