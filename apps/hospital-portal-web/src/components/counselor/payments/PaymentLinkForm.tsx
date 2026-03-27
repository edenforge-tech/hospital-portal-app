'use client';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGeneratePaymentLink } from '@/hooks/use-payments';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { CreatePaymentLinkRequest } from '@/types/counselor';

interface PaymentLinkFormProps {
  onSuccess?: () => void;
}

export function PaymentLinkForm({ onSuccess }: PaymentLinkFormProps) {
  const [generatedLink, setGeneratedLink] = useState<{ fullUrl: string; qrCodeUrl?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const generateLink = useGeneratePaymentLink();

  const form = useForm<CreatePaymentLinkRequest>({
    defaultValues: {
      sessionId: '',
      patientId: '',
      linkAmount: 0,
      expiryDays: 7,
    },
  });

  const onSubmit = async (data: CreatePaymentLinkRequest) => {
    try {
      const result = await generateLink.mutateAsync(data);
      setGeneratedLink({
        fullUrl: result.fullUrl,
        qrCodeUrl: result.qrCodeUrl,
      });
      toast.success('Payment link generated successfully');
    } catch (error) {
      toast.error('Failed to generate payment link');
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink.fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {!generatedLink ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter session ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patient ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="linkAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires In (Days) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 7"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recipientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={generateLink.isPending}>
                {generateLink.isPending ? 'Generating...' : 'Generate Payment Link'}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col items-center gap-4">
              <QRCodeSVG value={generatedLink.fullUrl} size={200} level="H" />
              <div className="w-full">
                <label className="text-sm font-medium">Payment Link:</label>
                <div className="flex items-center gap-2 mt-2">
                  <Input value={generatedLink.fullUrl} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Share this QR code or link with the patient for payment
              </p>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setGeneratedLink(null);
                form.reset();
              }}
            >
              Generate Another
            </Button>
            <Button type="button" onClick={onSuccess}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
