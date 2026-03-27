'use client';

import React, { useState, useEffect } from 'react';
import { Users, ChevronDown, ChevronUp, UserCircle, Phone, Mail, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CareTeamPanelProps {
  patientId: string;
}

interface Provider {
  id: string;
  name: string;
  role: string;
  specialty: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  lastInteraction?: string;
  interactionCount?: number;
}

export const CareTeamPanel: React.FC<CareTeamPanelProps> = ({ patientId }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCareTeam = async () => {
      if (!patientId) return;
      
      setLoading(true);
      try {
        // TODO: Fetch from Care Team API when available
        // For now, using mock data based on examinations, surgeries, prescriptions
        
        const mockProviders: Provider[] = [
          {
            id: '1',
            name: 'Dr. Sarah Johnson',
            role: 'Primary Ophthalmologist',
            specialty: 'Retina Specialist',
            phone: '+1 555-0101',
            email: 'sarah.johnson@hospital.com',
            lastInteraction: '2024-02-10',
            interactionCount: 15
          },
          {
            id: '2',
            name: 'Dr. Michael Chen',
            role: 'Optometrist',
            specialty: 'General Optometry',
            phone: '+1 555-0102',
            email: 'michael.chen@hospital.com',
            lastInteraction: '2024-02-08',
            interactionCount: 8
          },
          {
            id: '3',
            name: 'Dr. Emily Rodriguez',
            role: 'Surgeon',
            specialty: 'Cataract Surgery',
            phone: '+1 555-0103',
            email: 'emily.rodriguez@hospital.com',
            lastInteraction: '2024-01-25',
            interactionCount: 3
          },
          {
            id: '4',
            name: 'Nurse Patricia Williams',
            role: 'Nurse',
            specialty: 'Ophthalmic Nursing',
            phone: '+1 555-0104',
            lastInteraction: '2024-02-12',
            interactionCount: 22
          },
          {
            id: '5',
            name: 'Pharmacist David Lee',
            role: 'Pharmacist',
            specialty: 'Clinical Pharmacy',
            email: 'david.lee@hospital.com',
            lastInteraction: '2024-02-09',
            interactionCount: 12
          },
          {
            id: '6',
            name: 'Optician Maria Garcia',
            role: 'Optician',
            specialty: 'Eyewear Specialist',
            phone: '+1 555-0106',
            lastInteraction: '2024-01-30',
            interactionCount: 5
          },
          {
            id: '7',
            name: 'Counselor James Thompson',
            role: 'Counselor',
            specialty: 'Pre-Surgery Counseling',
            phone: '+1 555-0107',
            email: 'james.thompson@hospital.com',
            lastInteraction: '2024-01-20',
            interactionCount: 4
          },
          {
            id: '8',
            name: 'Case Manager Lisa Anderson',
            role: 'Case Manager',
            specialty: 'Patient Coordination',
            phone: '+1 555-0108',
            email: 'lisa.anderson@hospital.com',
            lastInteraction: '2024-02-11',
            interactionCount: 18
          }
        ];
        
        setProviders(mockProviders);
      } catch (error) {
        console.error('Failed to fetch care team:', error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCareTeam();
  }, [patientId]);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      </Card>
    );
  }

  const displayedProviders = expanded ? providers : providers.slice(0, 3);

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-900">Care Team</h3>
            <Badge variant="secondary" className="text-xs">{providers.length} Providers</Badge>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" /> Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> View All
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {displayedProviders.map((provider) => (
            <div
              key={provider.id}
              className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
            >
              {provider.photoUrl ? (
                <img
                  src={provider.photoUrl}
                  alt={provider.name}
                  className="w-12 h-12 rounded-full object-cover mb-2 border-2 border-gray-200 group-hover:border-indigo-400"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold text-sm mb-2 group-hover:from-indigo-600 group-hover:to-purple-700 transition-all">
                  {getInitials(provider.name)}
                </div>
              )}
              <p className="text-xs font-semibold text-gray-900 text-center line-clamp-1">{provider.name}</p>
              <p className="text-xs text-indigo-600 font-medium text-center line-clamp-1">{provider.role}</p>
              <p className="text-xs text-gray-500 text-center line-clamp-1 mt-0.5">{provider.specialty}</p>
              
              {provider.lastInteraction && (
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(provider.lastInteraction)}
                </div>
              )}
              
              {provider.interactionCount !== undefined && provider.interactionCount > 0 && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {provider.interactionCount} visit{provider.interactionCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Provider Details</h4>
            <div className="space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {provider.photoUrl ? (
                      <img
                        src={provider.photoUrl}
                        alt={provider.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold text-xs">
                        {getInitials(provider.name)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                      <p className="text-xs text-gray-500">{provider.role} • {provider.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.phone && (
                      <a
                        href={`tel:${provider.phone}`}
                        className="p-1.5 text-gray-600 hover:bg-white hover:text-indigo-600 rounded transition-colors"
                        title={provider.phone}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {provider.email && (
                      <a
                        href={`mailto:${provider.email}`}
                        className="p-1.5 text-gray-600 hover:bg-white hover:text-indigo-600 rounded transition-colors"
                        title={provider.email}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <Button variant="outline" size="sm" className="w-full">
          <UserCircle className="w-4 h-4 mr-2" />
          Manage Care Team
        </Button>
      </div>
    </Card>
  );
};
