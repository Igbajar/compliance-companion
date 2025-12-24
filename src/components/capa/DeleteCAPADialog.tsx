import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CAPAAction } from "@/hooks/useCapaActions";

interface DeleteCAPADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capa: CAPAAction | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteCAPADialog = ({
  open,
  onOpenChange,
  capa,
  onConfirm,
  isDeleting,
}: DeleteCAPADialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete CAPA</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{capa?.title}"? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
