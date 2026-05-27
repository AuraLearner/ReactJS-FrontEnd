import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import type { ScreenId } from './components/Navbar';
import LoginScreen from './screens/LoginScreen';
import AdminDashboard from './screens/AdminDashboard';
import AddLearner from './screens/AddLearner';
import CsvUpload from './screens/CsvUpload';
import MentorDashboard from './screens/MentorDashboard';
import Assessment from './screens/Assessment';
import AiPrediction from './screens/AiPrediction';
import Analytics from './screens/Analytics';
import Notifications from './screens/Notifications';
import LearnerDashboard from './screens/LearnerDashboard';
import Assignments from './screens/Assignments';
import Settings from './screens/Settings';
import PendingApprovals from './screens/PendingApprovals';
import { ToastProvider } from './components/ToastContext';
import NotificationListener from './components/NotificationListener';
import { clearAuthSession, getStoredRole, getStoredToken } from './utils/api';
import { getHomeScreenForRole, getSessionRole, isScreenAccessible } from './utils/rbac';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function resolveScreenFromRole(role: string): ScreenId {
  return getHomeScreenForRole(role);
}

function getInitialScreen(): ScreenId {
  const token = getStoredToken();

  if (!token) {
    return 'login';
  }

  return resolveScreenFromRole(getStoredRole());
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>(getInitialScreen);
  const token = getStoredToken();
  const role = getStoredRole();

  useEffect(() => {
    const sessionRole = getSessionRole();

    if (!token) {
      if (activeScreen !== 'login') {
        setActiveScreen('login');
      }

      return;
    }

    if (activeScreen === 'login' || !isScreenAccessible(activeScreen, sessionRole, token)) {
      setActiveScreen(getHomeScreenForRole(sessionRole));
    }
  }, [activeScreen, role, token]);

  const handleLogout = () => {
    clearAuthSession();
    setActiveScreen('login');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'login': return <LoginScreen onLoginSuccess={setActiveScreen} />;
      case 'admin': return <AdminDashboard onNavigate={setActiveScreen} />;
      case 'addlearner': return <AddLearner />;
      case 'pending': return <PendingApprovals />;
      case 'csvupload': return <CsvUpload />;
      case 'mentor': return <MentorDashboard />;
      case 'assessment': return <Assessment />;
      case 'prediction': return <AiPrediction />;
      case 'analytics': return <Analytics />;
      case 'notifications': return <Notifications />;
      case 'learner': return <LearnerDashboard />;
      case 'assignments': return <Assignments />;
      case 'settings': return <Settings />;
    }
  };

  return (
    <ToastProvider>
      <NotificationListener />
      <div className="min-h-screen bg-crust">
        <Navbar activeScreen={activeScreen} onNavigate={setActiveScreen} onLogout={handleLogout} />
        <AnimatePresence mode="wait">
          <motion.main
            key={activeScreen}
            {...pageTransition}
          >
            {renderScreen()}
          </motion.main>
        </AnimatePresence>
      </div>
    </ToastProvider>
  );
}
