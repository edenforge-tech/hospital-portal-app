'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/counselor/DataTable';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { ConsentTemplate } from '@/types/counselor';

interface ConsentTemplatesTableProps {
  data: ConsentTemplate[];
  isLoading?: boolean;
}

export function ConsentTemplatesTable({ data, isLoading }: ConsentTemplatesTableProps) {
  const columns: ColumnDef<ConsentTemplate>[] = [
    {
      accessorKey: 'templateName',
      header: 'Template Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.templateName}</div>
      ),
    },
    {
      accessorKey: 'consentCategory',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.consentCategory}</Badge>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground">
          {row.original.description || '-'}
        </div>
      ),
    },
    {
      header: 'Signatures Required',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.requiresPatientSignature && (
            <Badge variant="secondary" className="text-xs">Patient</Badge>
          )}
          {row.original.requiresWitnessSignature && (
            <Badge variant="secondary" className="text-xs">Witness</Badge>
          )}
          {row.original.requiresGuardianSignature && (
            <Badge variant="secondary" className="text-xs">Guardian</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
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
              Preview Template
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="templateName"
      searchPlaceholder="Search templates..."
      pageSize={10}
    />
  );
}
