import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardText, Clock, CheckCircle, Warning, Upload, X as XIcon, Eye } from '@phosphor-icons/react';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const iV = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

type AssignmentStatus = 'pending' | 'completed' | 'late' | 'submitted';

interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: AssignmentStatus;
  grade?: string;
  submittedAt?: string;
  description: string;
}

const mockAssignments: Assignment[] = [
  { id: 1, title: 'Java Collections Framework', subject: 'Core Java', dueDate: '2026-05-30', status: 'pending', description: 'Implement a custom HashMap and demonstrate its usage with CRUD operations.' },
  { id: 2, title: 'REST API Design Patterns', subject: 'Spring Boot', dueDate: '2026-05-28', status: 'pending', description: 'Design and document a RESTful API for an e-commerce platform.' },
  { id: 3, title: 'React Component Lifecycle', subject: 'React', dueDate: '2026-05-25', status: 'completed', grade: 'A', submittedAt: '2026-05-24', description: 'Build a React app demonstrating useState, useEffect, and useRef hooks.' },
  { id: 4, title: 'SQL Query Optimization', subject: 'Database', dueDate: '2026-05-22', status: 'completed', grade: 'B+', submittedAt: '2026-05-22', description: 'Optimize 10 given SQL queries and explain index usage.' },
  { id: 5, title: 'Data Structures — Trees', subject: 'DSA', dueDate: '2026-05-20', status: 'late', description: 'Implement BST, AVL Tree, and demonstrate traversal algorithms.' },
  { id: 6, title: 'Communication Workshop Report', subject: 'Soft Skills', dueDate: '2026-05-18', status: 'completed', grade: 'A-', submittedAt: '2026-05-17', description: 'Write a 500-word reflection on the mock interview session.' },
  { id: 7, title: 'Docker Containerization Lab', subject: 'DevOps', dueDate: '2026-06-02', status: 'pending', description: 'Containerize a Spring Boot app with Docker and write a docker-compose.' },
  { id: 8, title: 'Unit Testing with JUnit', subject: 'Core Java', dueDate: '2026-05-15', status: 'late', description: 'Write unit tests for the Learner service layer achieving 80%+ coverage.' },
];

type TabFilter = 'all' | 'pending' | 'completed' | 'late';

const statusConfig: Record<AssignmentStatus, { label: string; variant: 'blue' | 'green' | 'red' | 'amber'; icon: React.ReactNode }> = {
  pending: { label: 'Pending', variant: 'amber', icon: <Clock size={14} weight="fill" /> },
  submitted: { label: 'Submitted', variant: 'blue', icon: <Upload size={14} weight="fill" /> },
  completed: { label: 'Completed', variant: 'green', icon: <CheckCircle size={14} weight="fill" /> },
  late: { label: 'Overdue', variant: 'red', icon: <Warning size={14} weight="fill" /> },
};

export default function Assignments() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [assignments, setAssignments] = useState(mockAssignments);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const tabs: { id: TabFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: assignments.length },
    { id: 'pending', label: 'Pending', count: assignments.filter((a) => a.status === 'pending').length },
    { id: 'completed', label: 'Completed', count: assignments.filter((a) => a.status === 'completed' || a.status === 'submitted').length },
    { id: 'late', label: 'Overdue', count: assignments.filter((a) => a.status === 'late').length },
  ];

  const filtered = activeTab === 'all'
    ? assignments
    : activeTab === 'completed'
      ? assignments.filter((a) => a.status === 'completed' || a.status === 'submitted')
      : assignments.filter((a) => a.status === activeTab);

  const handleSubmit = (id: number) => {
    setSubmitting(id);
    setTimeout(() => {
      setAssignments((prev) => prev.map((a) =>
        a.id === id ? { ...a, status: 'submitted' as AssignmentStatus, submittedAt: new Date().toISOString().split('T')[0] } : a,
      ));
      setSubmitting(null);
    }, 1200);
  };

  const viewingAssignment = viewingId ? assignments.find((a) => a.id === viewingId) : null;

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const completedCount = assignments.filter((a) => a.status === 'completed' || a.status === 'submitted').length;
  const lateCount = assignments.filter((a) => a.status === 'late').length;

  return (
    <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14">
      <motion.div variants={iV}>
        <SectionHeader moduleLabel="LEARNER PORTAL" title="My Assignments"
          subtitle="Track your pending, completed, and overdue assignments" />
      </motion.div>

      {/* Stats */}
      <motion.div variants={iV} className="grid grid-cols-3 gap-4 sm:gap-5 mb-8">
        <div className="bg-amber/8 border border-amber/15 rounded-2xl p-4 sm:p-5 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-amber mb-1">{pendingCount}</div>
          <div className="text-[10px] sm:text-xs text-overlay0 font-mono tracking-wide">Pending</div>
        </div>
        <div className="bg-green/8 border border-green/15 rounded-2xl p-4 sm:p-5 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green mb-1">{completedCount}</div>
          <div className="text-[10px] sm:text-xs text-overlay0 font-mono tracking-wide">Completed</div>
        </div>
        <div className="bg-red/8 border border-red/15 rounded-2xl p-4 sm:p-5 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red mb-1">{lateCount}</div>
          <div className="text-[10px] sm:text-xs text-overlay0 font-mono tracking-wide">Overdue</div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={iV} className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue/12 text-blue border border-blue/25'
                : 'text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              activeTab === tab.id ? 'bg-blue/20 text-blue' : 'bg-surface0/50 text-overlay0'
            }`}>{tab.count}</span>
          </button>
        ))}
      </motion.div>

      {/* Assignment Cards */}
      <motion.div variants={iV} className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <div className="py-12 text-center text-sm text-overlay0 font-mono">
              No assignments in this category
            </div>
          </Card>
        ) : (
          filtered.map((assignment) => {
            const cfg = statusConfig[assignment.status];
            const isPending = assignment.status === 'pending' || assignment.status === 'late';
            const isCurrentlySubmitting = submitting === assignment.id;

            return (
              <motion.div
                key={assignment.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-mantle border border-surface0/60 rounded-2xl p-4 sm:p-6 hover:border-surface1/70 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      assignment.status === 'completed' ? 'bg-green/12 text-green'
                        : assignment.status === 'late' ? 'bg-red/12 text-red'
                          : 'bg-amber/12 text-amber'
                    }`}>
                      <ClipboardText size={20} weight="duotone" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-text truncate">{assignment.title}</h3>
                      <p className="text-[10px] text-overlay0 font-mono mt-0.5">{assignment.subject} · Due {assignment.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={cfg.variant} className="text-[10px]">
                      {cfg.icon} <span className="ml-1">{cfg.label}</span>
                    </Badge>
                    {assignment.grade ? (
                      <Badge variant="blue" className="text-[10px]">Grade: {assignment.grade}</Badge>
                    ) : null}
                  </div>
                </div>

                <p className="text-xs text-subtext0 leading-relaxed mb-4 line-clamp-2">{assignment.description}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setViewingId(assignment.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-subtext0 border border-surface0/60 hover:text-text hover:border-surface1 transition-colors cursor-pointer"
                  >
                    <Eye size={13} /> View Details
                  </button>
                  {isPending ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={isCurrentlySubmitting}
                      onClick={() => handleSubmit(assignment.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold bg-blue text-crust cursor-pointer shadow-[0_2px_12px_rgba(137,180,250,0.2)] disabled:opacity-60"
                    >
                      <Upload size={13} weight="bold" /> {isCurrentlySubmitting ? 'Submitting…' : 'Submit'}
                    </motion.button>
                  ) : null}
                  {assignment.submittedAt ? (
                    <span className="text-[10px] text-overlay0 font-mono">Submitted {assignment.submittedAt}</span>
                  ) : null}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewingAssignment ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-crust/70 backdrop-blur-sm px-4"
            onClick={() => setViewingId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-mantle border border-surface0/60 rounded-2xl p-6 sm:p-8 shadow-[0_16px_64px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-text mb-1">{viewingAssignment.title}</h3>
                  <p className="text-xs text-overlay0 font-mono">{viewingAssignment.subject} · Due {viewingAssignment.dueDate}</p>
                </div>
                <button onClick={() => setViewingId(null)} className="text-overlay0 hover:text-text transition-colors cursor-pointer ml-4">
                  <XIcon size={18} />
                </button>
              </div>

              <Badge variant={statusConfig[viewingAssignment.status].variant} className="mb-4">
                {statusConfig[viewingAssignment.status].icon}
                <span className="ml-1">{statusConfig[viewingAssignment.status].label}</span>
              </Badge>
              {viewingAssignment.grade ? (
                <Badge variant="blue" className="ml-2 mb-4">Grade: {viewingAssignment.grade}</Badge>
              ) : null}

              <div className="bg-base/50 rounded-xl p-4 border border-surface0/40 mb-6">
                <p className="text-sm text-text leading-relaxed">{viewingAssignment.description}</p>
              </div>

              {viewingAssignment.status === 'pending' || viewingAssignment.status === 'late' ? (
                <div className="border-2 border-dashed border-surface0/60 rounded-xl p-6 text-center mb-6">
                  <Upload size={32} weight="duotone" className="mx-auto mb-3 text-overlay1" />
                  <p className="text-xs text-overlay0 font-mono">Drag your file here or click to upload</p>
                </div>
              ) : null}

              <div className="flex gap-3">
                {(viewingAssignment.status === 'pending' || viewingAssignment.status === 'late') ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    disabled={submitting === viewingAssignment.id}
                    onClick={() => { handleSubmit(viewingAssignment.id); setViewingId(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-blue text-crust cursor-pointer disabled:opacity-60"
                  >
                    <Upload size={16} weight="bold" /> Submit Assignment
                  </motion.button>
                ) : null}
                <button
                  onClick={() => setViewingId(null)}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-subtext0 border border-surface0/60 hover:text-text transition-colors cursor-pointer"
                >Close</button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
