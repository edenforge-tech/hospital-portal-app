'use client';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useCreatePayment } from '@/hooks/use-payments';
import { toast } from 'sonner';
import type { CreatePaymentRequest } from '@/types/counselor';

interface PaymentFormProps {
  onSuccess?: () => void;
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const createPayment = useCreatePayment();

  const form = useForm<CreatePaymentRequest>({
    defaultValues: {
      sessionId: '',
      patientId: '',
      transactionType: 'Surgery Payment',
      paymentMethod: 'Cash',
      amount: 0,
      paymentFor: '',
      receiptRequired: true,
    },
  });

  const onSubmit = async (data: CreatePaymentRequest) => {
    try {
      await createPayment.mutateAsync(data);
      toast.success('Payment recorded successfully');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  return (
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
            name="transactionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Surgery Payment">Surgery Payment</SelectItem>
                    <SelectItem value="Consultation Fee">Consultation Fee</SelectItem>
                    <SelectItem value="Medication">Medication</SelectItem>
                    <SelectItem value="Tests & Investigations">Tests & Investigations</SelectItem>
                    <SelectItem value="Room Charges">Room Charges</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="RTGS">RTGS</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="amount"
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
          name="paymentFor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment For *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Cataract Surgery OD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('paymentMethod') === 'Card' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="transactionReferenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Reference #</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter reference number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardLastFourDigits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Last 4 Digits</FormLabel>
                  <FormControl>
                    <Input placeholder="XXXX" maxLength={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {(form.watch('paymentMethod') === 'UPI') && (
          <FormField
            control={form.control}
            name="upiTransactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UPI Transaction ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter UPI transaction ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="receiptRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Generate Receipt</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button type="submit" disabled={createPayment.isPending}>
            {createPayment.isPending ? 'Recording...' : 'Record Payment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
