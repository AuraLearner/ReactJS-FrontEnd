import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './ToastContext';
import { getStoredToken } from '../utils/api';

const SOCKET_URL = import.meta.env.VITE_NOTIFICATIONS_URL ?? 'https://auralearnernotifications.azaken.com';

let socket: Socket | null = null;

export default function NotificationListener() {
  const { showToast } = useToast();
  const token = getStoredToken();

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    if (!socket) {
      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('Connected to real-time notification service');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from notification service');
      });

      // Event Listeners
      socket.on('newRegistration', (data: any) => {
        showToast({
          title: data.title || 'New Registration',
          message: data.message || 'A new learner is waiting for profile approval.',
          type: 'info',
        });
      });

      socket.on('newAssessment', (data: any) => {
        showToast({
          title: 'Assessment Uploaded',
          message: data.message || 'New assessment scores have been recorded.',
          type: 'success',
        });
      });

      socket.on('predictionGenerated', (data: any) => {
        showToast({
          title: 'AI Prediction Ready',
          message: data.message || 'A new LearnerIQ AI prediction has been generated.',
          type: 'success',
        });
      });

      socket.on('scoreUpdated', (data: any) => {
        showToast({
          title: 'Score Updated',
          message: data.message || 'Learner scores have been modified.',
          type: 'info',
        });
      });

      socket.on('mentorFeedback', (data: any) => {
        showToast({
          title: 'New Feedback',
          message: data.message || 'A mentor has left new feedback.',
          type: 'info',
        });
      });

      socket.on('bulkUploadComplete', (data: any) => {
        showToast({
          title: 'Bulk Upload Complete',
          message: data.message || 'The CSV batch upload has finished processing.',
          type: 'success',
        });
      });
    }

    return () => {
      // We don't disconnect on unmount because this runs at the App level
      // and we want to keep the connection alive across routes.
      // Connection is only destroyed when token changes (logout).
    };
  }, [token, showToast]);

  return null; // This is a logic-only component
}
