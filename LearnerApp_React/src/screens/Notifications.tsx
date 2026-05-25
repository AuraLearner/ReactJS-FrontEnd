import { motion } from 'framer-motion';
import { Bell, Lightning, Brain, ChatCircle, UploadSimple, Circle } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

const notifications = [
  { icon: <Bell size={18} weight="duotone" className="text-blue" />, title: 'Coding Assessment assigned to JAVA_FS_2026', time: 'Just now · Mentor: John Mentor', badge: 'New', v: 'blue' as const },
  { icon: <Lightning size={18} weight="duotone" className="text-green" />, title: "Rahul Sharma's scores updated by John Mentor", time: '2 min ago · PUT /api/assessments/142', badge: 'Score', v: 'green' as const },
  { icon: <Brain size={18} weight="duotone" className="text-mauve" />, title: 'Placement prediction generated for Priya Patel', time: '5 min ago · Probability: 92%', badge: 'AI', v: 'blue' as const },
  { icon: <ChatCircle size={18} weight="duotone" className="text-peach" />, title: 'Mentor feedback added for Arjun Kumar', time: '12 min ago · Focus: Coding improvement needed', badge: 'Feedback', v: 'amber' as const },
  { icon: <UploadSimple size={18} weight="duotone" className="text-green" />, title: '250 learners imported via CSV upload', time: '1 hr ago · Admin: System', badge: 'Bulk', v: 'green' as const },
];

const events = [
  { name: 'New Assessment Assigned', desc: 'Spring Boot → NodeJS → Socket.IO', border: 'border-l-blue' },
  { name: 'Scores Updated', desc: 'PUT /api/assessments/{id} → Event Emitted', border: 'border-l-green' },
  { name: 'Prediction Generated', desc: 'Python ML Response → DB → Push', border: 'border-l-mauve' },
  { name: 'Mentor Feedback Added', desc: 'POST /api/feedback → Real-time Push', border: 'border-l-peach' },
];

const socketArch = [
  { label: 'Client (Browser)', color: 'text-green', bg: 'bg-green/8' },
  { label: '↕ WebSocket', color: 'text-overlay0', indent: true },
  { label: 'NodeJS Socket Server', color: 'text-blue', bg: 'bg-blue/8' },
  { label: '↕ HTTP Event', color: 'text-overlay0', indent: true },
  { label: 'Spring Boot API', color: 'text-mauve', bg: 'bg-mauve/8' },
  { label: '↕ JDBC', color: 'text-overlay0', indent: true },
  { label: 'PostgreSQL DB', color: 'text-peach', bg: 'bg-peach/8' },
];

export default function Notifications() {
  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="MODULE 7 · UC-8" title="Notification Center"
          subtitle="Real-time notifications via Socket.IO · NodeJS socket server → Spring Boot events" />
      </motion.div>
      <motion.div variants={iV} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-xl sm:text-2xl font-bold">Live Notifications</h2>
            <Badge variant="green" className="animate-pulse-live"><Circle size={8} weight="fill" className="mr-1" /> Live</Badge>
          </div>
          <div className="space-y-2">
            {notifications.map((n, i) => (
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
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-6 lg:gap-8">
          <Card>
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-8">Notification Events</h2>
            <div className="space-y-4 lg:space-y-5">
              {events.map((e) => (
                <motion.div key={e.name} whileHover={{ x: 6 }}
                  className={`p-5 lg:p-6 bg-base/50 rounded-2xl border border-surface0/40 border-l-[3px] ${e.border} hover:border-surface1/50 transition-colors`}>
                  <p className="text-sm font-bold text-text mb-1.5">{e.name}</p>
                  <p className="text-xs text-overlay0 font-mono tracking-wide">{e.desc}</p>
                </motion.div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-display text-lg font-bold mb-6">Socket Architecture</h3>
            <div className="space-y-2.5">
              {socketArch.map((s, i) => (
                <div key={i} className={`text-xs font-mono ${s.color} ${s.indent ? 'pl-6 py-1' : `py-3 px-4 rounded-xl ${s.bg} font-semibold border border-surface0/30`}`}>
                  {s.label}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
