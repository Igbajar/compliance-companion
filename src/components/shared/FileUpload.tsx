import { useState, useRef } from "react";
import { Upload, X, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  bucket: "evidence" | "documents" | "certificates";
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  onUpload: (url: string, fileName: string) => void;
  existingUrl?: string;
  existingFileName?: string;
  className?: string;
}

export function FileUpload({
  bucket,
  folder = "",
  accept = "*",
  maxSize = 10,
  onUpload,
  existingUrl,
  existingFileName,
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(existingFileName || "");
  const [fileUrl, setFileUrl] = useState(existingUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const filePath = folder
        ? `${folder}/${timestamp}-${file.name}`
        : `${timestamp}-${file.name}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setFileName(file.name);
      setFileUrl(urlData.publicUrl);
      onUpload(urlData.publicUrl, file.name);

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!fileUrl) return;

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split(`/${bucket}/`);
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from(bucket).remove([filePath]);
      }

      setFileName("");
      setFileUrl("");
      onUpload("", "");

      toast({
        title: "File removed",
        description: "The file has been removed.",
      });
    } catch (error: any) {
      console.error("Remove error:", error);
      toast({
        title: "Remove failed",
        description: error.message || "Failed to remove file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {fileUrl ? (
        <div className="flex items-center gap-2 p-3 bg-secondary/50 border border-border rounded-lg">
          <File className="w-4 h-4 text-primary shrink-0" />
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-sm text-foreground hover:text-primary truncate"
          >
            {fileName || "Uploaded file"}
          </a>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-dashed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        Max file size: {maxSize}MB
      </p>
    </div>
  );
}
