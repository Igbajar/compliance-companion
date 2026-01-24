import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Mail, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEmailNotifications } from "@/hooks/useEmailNotifications";
import { formatDistanceToNow } from "date-fns";

function getStatusBadge(status: string) {
  switch (status) {
    case "sent":
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Sent
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
  }
}

function formatEmailType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function EmailHistoryTable() {
  const { notifications, isLoading, error } = useEmailNotifications();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[200px] gap-2">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-muted-foreground text-center">
            Failed to load email history. Make sure you have admin permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notification History
        </CardTitle>
        <CardDescription>
          View all outgoing email notifications and their delivery status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!notifications || notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No email notifications sent yet.</p>
            <p className="text-sm mt-2">Email history will appear here once notifications are sent.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {notification.recipient_name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {notification.recipient_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {notification.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatEmailType(notification.email_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(notification.status)}
                      {notification.error_message && (
                        <span className="text-xs text-destructive truncate max-w-[150px]" title={notification.error_message}>
                          {notification.error_message}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {notification.sent_at
                      ? formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })
                      : formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
