'use client';

import { useState, useEffect } from 'react';
import { Search, Pill, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { prescriptionApi } from '@/lib/api/prescriptions.api';

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  form: string;
  standardDosages: string[];
}

interface Props {
  value: string;
  onChange: (medication: Medication) => void;
}

// Mock medication database
const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Moxifloxacin',
    genericName: 'Moxifloxacin HCl',
    category: 'Antibiotic',
    form: 'Eye Drops',
    standardDosages: ['0.5%'],
  },
  {
    id: '2',
    name: 'Gatifloxacin',
    genericName: 'Gatifloxacin',
    category: 'Antibiotic',
    form: 'Eye Drops',
    standardDosages: ['0.3%', '0.5%'],
  },
  {
    id: '3',
    name: 'Prednisolone Acetate',
    genericName: 'Prednisolone Acetate',
    category: 'Steroid',
    form: 'Eye Drops',
    standardDosages: ['1%'],
  },
  {
    id: '4',
    name: 'Dexamethasone',
    genericName: 'Dexamethasone',
    category: 'Steroid',
    form: 'Eye Drops',
    standardDosages: ['0.1%'],
  },
  {
    id: '5',
    name: 'Latanoprost',
    genericName: 'Latanoprost',
    category: 'Glaucoma',
    form: 'Eye Drops',
    standardDosages: ['0.005%'],
  },
  {
    id: '6',
    name: 'Timolol',
    genericName: 'Timolol Maleate',
    category: 'Glaucoma',
    form: 'Eye Drops',
    standardDosages: ['0.25%', '0.5%'],
  },
  {
    id: '7',
    name: 'Brimonidine',
    genericName: 'Brimonidine Tartrate',
    category: 'Glaucoma',
    form: 'Eye Drops',
    standardDosages: ['0.1%', '0.15%', '0.2%'],
  },
  {
    id: '8',
    name: 'Dorzolamide',
    genericName: 'Dorzolamide HCl',
    category: 'Glaucoma',
    form: 'Eye Drops',
    standardDosages: ['2%'],
  },
  {
    id: '9',
    name: 'Ketorolac',
    genericName: 'Ketorolac Tromethamine',
    category: 'NSAID',
    form: 'Eye Drops',
    standardDosages: ['0.4%', '0.5%'],
  },
  {
    id: '10',
    name: 'Nepafenac',
    genericName: 'Nepafenac',
    category: 'NSAID',
    form: 'Eye Drops',
    standardDosages: ['0.1%', '0.3%'],
  },
  {
    id: '11',
    name: 'Bevacizumab',
    genericName: 'Bevacizumab',
    category: 'Anti-VEGF',
    form: 'Injection',
    standardDosages: ['1.25mg/0.05ml', '2.5mg/0.1ml'],
  },
  {
    id: '12',
    name: 'Ranibizumab',
    genericName: 'Ranibizumab',
    category: 'Anti-VEGF',
    form: 'Injection',
    standardDosages: ['0.5mg/0.05ml'],
  },
  {
    id: '13',
    name: 'Aflibercept',
    genericName: 'Aflibercept',
    category: 'Anti-VEGF',
    form: 'Injection',
    standardDosages: ['2mg/0.05ml'],
  },
  {
    id: '14',
    name: 'Tropicamide',
    genericName: 'Tropicamide',
    category: 'Mydriatic',
    form: 'Eye Drops',
    standardDosages: ['0.5%', '1%'],
  },
  {
    id: '15',
    name: 'Phenylephrine',
    genericName: 'Phenylephrine HCl',
    category: 'Mydriatic',
    form: 'Eye Drops',
    standardDosages: ['2.5%', '10%'],
  },
  {
    id: '16',
    name: 'Cyclopentolate',
    genericName: 'Cyclopentolate HCl',
    category: 'Cycloplegic',
    form: 'Eye Drops',
    standardDosages: ['0.5%', '1%', '2%'],
  },
  {
    id: '17',
    name: 'Atropine',
    genericName: 'Atropine Sulfate',
    category: 'Cycloplegic',
    form: 'Eye Drops',
    standardDosages: ['0.5%', '1%'],
  },
  {
    id: '18',
    name: 'Artificial Tears',
    genericName: 'Polyethylene Glycol',
    category: 'Lubricant',
    form: 'Eye Drops',
    standardDosages: ['0.4%'],
  },
  {
    id: '19',
    name: 'Olopatadine',
    genericName: 'Olopatadine HCl',
    category: 'Antihistamine',
    form: 'Eye Drops',
    standardDosages: ['0.1%', '0.2%'],
  },
  {
    id: '20',
    name: 'Ketotifen',
    genericName: 'Ketotifen Fumarate',
    category: 'Antihistamine',
    form: 'Eye Drops',
    standardDosages: ['0.025%'],
  },
];

export function MedicationSearchCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setFilteredMedications([]);
      return;
    }

    setIsSearching(true);
    
    const timer = setTimeout(async () => {
      try {
        const response = await prescriptionApi.searchMedications(searchQuery, 1, 10);
        setFilteredMedications(response.data.map(med => ({
          id: med.id,
          name: med.name,
          genericName: med.genericName,
          category: med.category,
          form: med.form,
          standardDosages: med.standardDosages,
        })));
      } catch (error) {
        console.error('Failed to search medications:', error);
        toast.error('Failed to search medications');
        setFilteredMedications([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (medication: Medication) => {
    onChange(medication);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Medication Name *</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search medications..."
              className="pl-10"
            />
            {value && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{value}</span>
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandEmpty>
              {isSearching ? 'Searching...' : 'No medications found. Try a different search.'}
            </CommandEmpty>
            {filteredMedications.length > 0 && (
              <CommandGroup heading="Medications">
                {filteredMedications.map((med) => (
                  <CommandItem
                    key={med.id}
                    onSelect={() => handleSelect(med)}
                    className="flex items-start justify-between cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <Pill className="h-4 w-4 mt-0.5 text-blue-600" />
                      <div>
                        <div className="font-medium">{med.name}</div>
                        {med.genericName && (
                          <div className="text-xs text-gray-500">{med.genericName}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {med.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{med.form}</span>
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
