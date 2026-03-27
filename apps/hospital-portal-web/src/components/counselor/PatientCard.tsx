'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Phone, Mail, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
}

interface PatientCardProps {
  patient: Patient;
  showDetails?: boolean;
  className?: string;
}

export function PatientCard({ patient, showDetails = true, className }: PatientCardProps) {
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();
  
  const age = patient.dateOfBirth
    ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={patient.photoUrl} alt={fullName} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{fullName}</h3>
              {patient.gender && (
                <Badge variant="outline" className="text-xs">
                  {patient.gender}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{patient.patientNumber}</span>
              {age !== null && (
                <>
                  <span>•</span>
                  <span>{age} years</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {patient.dateOfBirth && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
              </div>
            )}
            {patient.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{patient.phone}</span>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{patient.email}</span>
              </div>
            )}
            {patient.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{patient.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
