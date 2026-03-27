'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/counselor/DataTable';
import { StatusBadge } from '@/components/counselor/StatusBadge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, FileSignature, UserCheck, FileCheck, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PatientConsent } from '@/types/counselor';
import { useSignConsent, useWitnessSignConsent, useFinalizeConsent } from '@/hooks/use-consents';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { SignatureModal, SignatureData } from './SignatureModal';

interface PatientConsentsTableProps {
  data: PatientConsent[];
  isLoading?: boolean;
}

type SignatureModalState = {
  isOpen: boolean;
  type: 'patient' | 'witness' | 'counselor' | null;
  consentId: string | null;
};

export function PatientConsentsTable({ data, isLoading }: PatientConsentsTableProps) {
  const { user } = useAuthStore();
  const signConsent = useSignConsent();
  const witnessSign = useWitnessSignConsent();
  const finalizeConsent = useFinalizeConsent();
  
  const [signatureModal, setSignatureModal] = useState<SignatureModalState>({
    isOpen: false,
    type: null,
    consentId: null,
  });

  // Open signature modal for patient
  const handlePatientSign = (id: string) => {
    setSignatureModal({
      isOpen: true,
      type: 'patient',
      consentId: id,
    });
  };

  // Open signature modal for witness
  const handleWitnessSign = (id: string) => {
    setSignatureModal({
      isOpen: true,
      type: 'witness',
      consentId: id,
    });
  };

  // Open signature modal for counselor
  const handleCounselorSign = (id: string) => {
    setSignatureModal({
      isOpen: true,
      type: 'counselor',
      consentId: id,
    });
  };

  // Handle signature submission
  const handleSignatureSubmit = async (data: SignatureData) => {
    if (!signatureModal.consentId) return;

    try {
      if (signatureModal.type === 'patient') {
        await signConsent.mutateAsync({
          id: signatureModal.consentId,
          signatureData: {
            signatureType: 'Patient',
            signatureData: data.signatureBase64,
            signerName: data.signerName,
          },
        });
        toast.success('Patient signature added successfully');
      } else if (signatureModal.type === 'witness') {
        await witnessSign.mutateAsync({
          id: signatureModal.consentId,
          witnessData: {
            witnessSignature: data.signatureBase64,
            witnessName: data.signerName,
            witnessRelation: data.signerRelation || '',
          },
        });
        toast.success('Witness signature added successfully');
      } else if (signatureModal.type === 'counselor') {
        // Counselor counter-signature (same as patient sign but with counselor type)
        await signConsent.mutateAsync({
          id: signatureModal.consentId,
          signatureData: {
            signatureType: 'Counselor',
            signatureData: data.signatureBase64,
            signerName: data.signerName,
          },
        });
        toast.success('Counselor signature added successfully');
      }

      // Close modal
      setSignatureModal({ isOpen: false, type: null, consentId: null });
    } catch (error) {
      toast.error(`Failed to add ${signatureModal.type} signature`);
    }
  };

  const handleFinalize = async (id: string) => {
    if (!confirm('Finalize this consent? This action cannot be undone.')) return;

    try {
      await finalizeConsent.mutateAsync(id);
      toast.success('Consent finalized successfully');
    } catch (error) {
      toast.error('Failed to finalize consent');
    }
  };

  const columns: ColumnDef<PatientConsent>[] = [
    {
      accessorKey: 'templateName',
      header: 'Template',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.templateName}</div>
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
      accessorKey: 'consentStatus',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.consentStatus} />,
    },
    {
      header: 'Signatures',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.patientSignedAt && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              ✓ Patient
            </span>
          )}
          {row.original.witnessSignedAt && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              ✓ Witness
            </span>
          )}
          {row.original.guardianSignedAt && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              ✓ Guardian
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const consent = row.original;
        const canPatientSign = consent.consentStatus === 'Draft' && !consent.patientSignedAt;
        const canWitnessSign = consent.patientSignedAt && !consent.witnessSignedAt;
        const canCounselorSign = consent.patientSignedAt && 
          (consent.witnessSignedAt || !consent.requiresWitnessSignature);
        const canFinalize = consent.patientSignedAt && 
          (consent.witnessSignedAt || !consent.requiresWitnessSignature) &&
          consent.consentStatus !== 'Finalized';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Consent
              </DropdownMenuItem>
              {canPatientSign && (
                <DropdownMenuItem onClick={() => handlePatientSign(consent.id)}>
                  <FileSignature className="mr-2 h-4 w-4" />
                  Patient Sign
                </DropdownMenuItem>
              )}
              {canWitnessSign && (
                <DropdownMenuItem onClick={() => handleWitnessSign(consent.id)}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Witness Sign
                </DropdownMenuItem>
              )}
              {canCounselorSign && (
                <DropdownMenuItem onClick={() => handleCounselorSign(consent.id)}>
                  <FileSignature className="mr-2 h-4 w-4" />
                  Counselor Counter-Sign
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canFinalize && (
                <DropdownMenuItem onClick={() => handleFinalize(consent.id)}>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Finalize
                </DropdownMenuItem>
              )}
              {consent.pdfUrl && (
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  // Determine modal title and props based on signature type
  const getModalProps = () => {
    switch (signatureModal.type) {
      case 'patient':
        return {
          title: 'Patient Signature',
          signerLabel: 'Patient Name',
          requiresRelation: false,
        };
      case 'witness':
        return {
          title: 'Witness Signature',
          signerLabel: 'Witness Name',
          requiresRelation: true,
        };
      case 'counselor':
        return {
          title: 'Counselor Counter-Signature',
          signerLabel: 'Counselor Name',
          requiresRelation: false,
        };
      default:
        return {
          title: 'Signature',
          signerLabel: 'Name',
          requiresRelation: false,
        };
    }
  };

  const modalProps = getModalProps();

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="patientName"
        searchPlaceholder="Search by patient name..."
        pageSize={10}
      />

      {/* Signature Modal */}
      <SignatureModal
        isOpen={signatureModal.isOpen}
        onClose={() => setSignatureModal({ isOpen: false, type: null, consentId: null })}
        onSubmit={handleSignatureSubmit}
        title={modalProps.title}
        signerLabel={modalProps.signerLabel}
        requiresRelation={modalProps.requiresRelation}
        isSubmitting={signConsent.isPending || witnessSign.isPending}
      />
    </>
  );
}
