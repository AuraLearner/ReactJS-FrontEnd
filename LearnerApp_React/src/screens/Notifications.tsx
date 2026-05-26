import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Bell, Lightning, Brain, ChatCircle, Circle } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { getStoredToken } from '../utils/api';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };


type NotificationItem = {
  icon: ReactNode;
  title: string;
  time: string;
  badge: string;
  v: 'blue' | 'green' | 'amber' | 'mauve';
};

const initialNotifications: NotificationItem[] = [];

const events = [
  { name: 'Assessment Updates', desc: 'See new assessments and score changes as they happen.', dot: 'bg-blue', glow: 'shadow-[0_0_8px_rgba(137,180,250,0.4)]' },
  { name: 'Placement Predictions', desc: 'Track readiness changes for any learner you follow.', dot: 'bg-green', glow: 'shadow-[0_0_8px_rgba(166,227,161,0.4)]' },
  { name: 'Mentor Feedback', desc: 'Keep up with new mentor comments and follow-ups.', dot: 'bg-mauve', glow: 'shadow-[0_0_8px_rgba(203,166,247,0.4)]' },
  { name: 'Batch Activity', desc: 'Review the latest activity across your batch.', dot: 'bg-peach', glow: 'shadow-[0_0_8px_rgba(250,179,135,0.4)]' },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const addNotif = (icon: ReactNode, title: string, v: 'blue' | 'green' | 'amber' | 'mauve', badge: string) => {
    const newItem = { icon, title, time: new Date().toLocaleTimeString(), badge, v };
    setNotifications((prev) => [newItem, ...prev].slice(0, 10)); // Keep last 10
  };

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setIsConnected(false);
      setConnectionError('Sign in to connect to live notifications.');
      return;
    }

    const socket: Socket = io('https://auralearnernotifications.azaken.com', {
      auth: { token },
    });

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => setIsConnected(false);

    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      setConnectionError(error.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Listen to real-time events from Spring Boot (via NodeJS)
    socket.on('newAssessment', (data) => addNotif(<Bell size={18} weight="duotone" className="text-blue" />, `New Assessment: ${data.type || 'Added'}`, 'blue', 'New'));
    socket.on('scoreUpdated', (data) => addNotif(<Lightning size={18} weight="duotone" className="text-green" />, `Score Updated for Learner ${data.learnerId || ''}`, 'green', 'Score'));
    socket.on('predictionGenerated', (data) => addNotif(<Brain size={18} weight="duotone" className="text-mauve" />, `Prediction updated: ${data.status || 'Ready'}`, 'mauve', 'AI'));
    socket.on('mentorFeedback', () => addNotif(<ChatCircle size={18} weight="duotone" className="text-peach" />, `New Feedback added by Mentor`, 'amber', 'Feedback'));

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 7 · UC-8" title="Notification Center"
          subtitle="Track learner, mentor, and placement updates in one place" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-xl sm:text-2xl font-bold">Live Activity Feed</h2>
            {isConnected ? (
              <Badge variant="green" className="animate-pulse-live"><Circle size={8} weight="fill" className="mr-1" /> Live Connected</Badge>
            ) : (
              <Badge variant="amber"><Circle size={8} weight="duotone" className="mr-1" /> Disconnected</Badge>
            )}
          </div>
          {connectionError ? (
            <div className="mb-5 rounded-xl border border-red/20 bg-red/10 px-4 py-3 text-sm text-red-100">
              {connectionError}
            </div>
          ) : null}
          <div className="space-y-2">
            {notifications.length > 0 ? notifications.map((n, i) => (
              <motion.div key={i}
                className="flex gap-4 lg:gap-5 items-start p-4 lg:p-5 rounded-2xl hover:bg-base/50 transition-all"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12, duration: 0.35 }}>
                <div className="w-10 h-10 rounded-xl bg-surface0/40 flex items-center justify-center shrink-0">{n.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text font-medium leading-relaxed">{n.title}</p>
                  <p className="text-[10px] text-overlay0 font-mono mt-2 tracking-wide">{n.time}</p>
                </div>
                <Badge variant={n.v}>{n.badge}</Badge>
              </motion.div>
            )) : (
              <div className="rounded-2xl border border-dashed border-surface0/50 bg-base/20 px-5 py-6 text-sm text-overlay0">
                {connectionError
                  ? 'Connect the socket to start receiving live events.'
                  : isConnected
                    ? 'Waiting for live events...'
                    : 'Notification feed is idle until a valid session connects.'}
              </div>
            )}
          </div>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
          <Card>
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-3">Activity Types</h2>
            <p className="text-xs text-overlay0 font-mono tracking-wide mb-8">User-focused updates that can appear in your feed</p>
            <div className="space-y-3 lg:space-y-4">
              {events.map((e) => (
                <motion.div key={e.name} whileHover={{ x: 4 }}
                  className="flex items-start gap-4 p-4 lg:p-5 bg-base/50 rounded-2xl border border-surface0/40 hover:border-surface1/60 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full ${e.dot} ${e.glow} mt-1.5 shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text mb-1">{e.name}</p>
                    <p className="text-xs text-subtext0 leading-relaxed">{e.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-display text-lg font-bold mb-4">Connection Status</h3>
            <div className="space-y-3 text-sm text-subtext0">
              <div className="flex items-center justify-between gap-4">
                <span>Session</span>
                <strong className="text-text">{getStoredToken() ? 'Signed in' : 'Signed out'}</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Feed</span>
                <strong className="text-text">{isConnected ? 'Live' : 'Waiting'}</strong>
              </div>
              <div className="rounded-xl border border-surface0/40 bg-base/30 px-4 py-3 text-xs text-overlay0 leading-relaxed">
                This page stays focused on your updates. No system diagrams or stack details are shown here.
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
