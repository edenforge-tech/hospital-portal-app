'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/counselor/DataTable';
import { StatusBadge } from '@/components/counselor/StatusBadge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Send, Bell, XCircle, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PaymentLink } from '@/types/counselor';
import { useSendPaymentLink, useSendPaymentReminder, useExpirePaymentLink } from '@/hooks/use-payments';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface PaymentLinksTableProps {
  data: PaymentLink[];
  isLoading?: boolean;
}

export function PaymentLinksTable({ data, isLoading }: PaymentLinksTableProps) {
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const sendLink = useSendPaymentLink();
  const sendReminder = useSendPaymentReminder();
  const expireLink = useExpirePaymentLink();

  const handleSend = async (id: string, method: 'SMS' | 'Email' | 'WhatsApp') => {
    try {
      await sendLink.mutateAsync({ id, sendVia: method });
      toast.success(`Payment link sent via ${method}`);
    } catch (error) {
      toast.error(`Failed to send link via ${method}`);
    }
  };

  const handleReminder = async (id: string) => {
    try {
      await sendReminder.mutateAsync(id);
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const handleExpire = async (id: string) => {
    if (!confirm('Are you sure you want to expire this payment link?')) return;
    
    try {
      await expireLink.mutateAsync(id);
      toast.success('Payment link expired');
    } catch (error) {
      toast.error('Failed to expire link');
    }
  };

  const columns: ColumnDef<PaymentLink>[] = [
    {
      accessorKey: 'paymentLinkId',
      header: 'Link ID',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.paymentLinkId || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.patientName}</div>
          <div className="text-xs text-muted-foreground">{row.original.patientId}</div>
        </div>
      ),
    },
    {
      accessorKey: 'linkAmount',
      header: 'Amount',
      cell: ({ row }) => `₹${row.original.linkAmount.toLocaleString()}`,
    },
    {
      accessorKey: 'linkStatus',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.linkStatus} />,
    },
    {
      accessorKey: 'sentVia',
      header: 'Sent Via',
      cell: ({ row }) => row.original.sentVia || '-',
    },
    {
      accessorKey: 'reminderSentCount',
      header: 'Reminders',
      cell: ({ row }) => row.original.reminderSentCount || 0,
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expires',
      cell: ({ row }) => new Date(row.original.expiryDate).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQRCode(row.original.fullUrl)}
          >
            QR
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => window.open(row.original.fullUrl, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Link
              </DropdownMenuItem>
              {row.original.linkStatus === 'Active' && (
                <>
                  <DropdownMenuItem onClick={() => handleSend(row.original.id, 'SMS')}>
                    <Send className="mr-2 h-4 w-4" />
                    Send via SMS
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSend(row.original.id, 'Email')}>
                    <Send className="mr-2 h-4 w-4" />
                    Send via Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSend(row.original.id, 'WhatsApp')}>
                    <Send className="mr-2 h-4 w-4" />
                    Send via WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReminder(row.original.id)}>
                    <Bell className="mr-2 h-4 w-4" />
                    Send Reminder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleExpire(row.original.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Expire Link
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="patientName"
        searchPlaceholder="Search by patient name..."
        pageSize={10}
      />

      {/* QR Code Dialog */}
      <Dialog open={!!showQRCode} onOpenChange={() => setShowQRCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Link QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {showQRCode && (
              <QRCodeSVG value={showQRCode} size={256} level="H" />
            )}
            <p className="text-sm text-muted-foreground text-center">
              Patient can scan this QR code to make payment
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
