'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Session {
  id: string;
  sessionNumber: string;
  patientName: string;
  sessionDate: string;
  status: string;
}

interface SessionSelectorProps {
  sessions: Session[];
  selectedSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  placeholder?: string;
  className?: string;
}

export function SessionSelector({
  sessions,
  selectedSessionId,
  onSessionSelect,
  placeholder = 'Select counseling session...',
  className,
}: SessionSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-[400px] justify-between', className)}
        >
          {selectedSession ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedSession.sessionNumber}</span>
              <span className="text-xs text-muted-foreground">
                {selectedSession.patientName} - {new Date(selectedSession.sessionDate).toLocaleDateString()}
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search sessions..." />
          <CommandEmpty>No session found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {sessions.map((session) => (
              <CommandItem
                key={session.id}
                value={`${session.sessionNumber} ${session.patientName}`}
                onSelect={() => {
                  onSessionSelect(session.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedSessionId === session.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{session.sessionNumber}</span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      session.status === 'InProgress' && 'bg-blue-100 text-blue-700',
                      session.status === 'Completed' && 'bg-green-100 text-green-700',
                      session.status === 'Pending' && 'bg-yellow-100 text-yellow-700'
                    )}>
                      {session.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {session.patientName} - {new Date(session.sessionDate).toLocaleDateString()}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
