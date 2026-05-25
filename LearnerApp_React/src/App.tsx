import { useState } from 'react';
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

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('login');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'login': return <LoginScreen />;
      case 'admin': return <AdminDashboard onNavigate={setActiveScreen} />;
      case 'addlearner': return <AddLearner />;
      case 'csvupload': return <CsvUpload />;
      case 'mentor': return <MentorDashboard />;
      case 'assessment': return <Assessment />;
      case 'prediction': return <AiPrediction />;
      case 'analytics': return <Analytics />;
      case 'notifications': return <Notifications />;
    }
  };

  return (
    <div className="min-h-screen bg-crust">
      <Navbar activeScreen={activeScreen} onNavigate={setActiveScreen} />
      <AnimatePresence mode="wait">
        <motion.main
          key={activeScreen}
          {...pageTransition}
        >
          {renderScreen()}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
