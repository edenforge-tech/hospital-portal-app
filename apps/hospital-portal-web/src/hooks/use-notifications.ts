import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface NotificationHookOptions {
  onAppointmentUpdate?: (appointmentId: string, status: string) => void;
  onAppointmentReminder?: (appointmentId: string, details: string) => void;
}

export function useNotifications(options?: NotificationHookOptions) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const startConnection = async () => {
      try {
        const connection = new HubConnectionBuilder()
          .withUrl('/notifications')  // Adjust URL based on your setup
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Information)
          .build();

        // Handle general notifications
        connection.on('ReceiveNotification', (type: string, message: string, details: string) => {
          switch (type) {
            case 'AppointmentUpdate':
              toast.info(message);
              break;
            case 'AppointmentReminder':
              toast.warning(message);
              break;
            case 'Error':
              toast.error(message);
              break;
            default:
              toast(message);
          }
        });

        // Handle specific appointment updates
        connection.on('AppointmentUpdated', (appointmentId: string, status: string) => {
          options?.onAppointmentUpdate?.(appointmentId, status);
          toast.info(`Appointment ${appointmentId} has been ${status.toLowerCase()}`);
        });

        // Handle appointment reminders
        connection.on('AppointmentReminder', (appointmentId: string, details: string) => {
          options?.onAppointmentReminder?.(appointmentId, details);
          toast.warning('Upcoming Appointment Reminder', {
            description: details,
            duration: 10000,  // Show for 10 seconds
            action: {
              label: 'View',
              onClick: () => {
                // Navigate to appointment details
                window.location.href = `/dashboard/appointments/${appointmentId}`;
              },
            },
          });
        });

        await connection.start();
        connectionRef.current = connection;
        setIsConnected(true);
      } catch (err) {
        console.error('Error establishing SignalR connection:', err);
        toast.error('Failed to connect to notification service');
      }
    };

    startConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [session?.user]);

  return { isConnected };
}