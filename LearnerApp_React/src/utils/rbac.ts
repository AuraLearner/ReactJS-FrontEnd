import type { ScreenId } from '../components/Navbar';
import { getStoredRole, getStoredToken } from './api';

export type AppRole = 'ADMIN' | 'MENTOR' | 'LEARNER';

const HOME_SCREEN_BY_ROLE: Record<AppRole, ScreenId> = {
  ADMIN: 'admin',
  MENTOR: 'mentor',
  LEARNER: 'learner',
};

const VISIBLE_SCREENS_BY_ROLE: Record<AppRole, ScreenId[]> = {
  ADMIN: ['admin', 'addlearner', 'csvupload', 'mentor', 'assessment', 'prediction', 'analytics', 'notifications', 'settings'],
  MENTOR: ['mentor', 'assessment', 'prediction', 'analytics', 'notifications', 'settings'],
  LEARNER: ['learner', 'assignments', 'prediction', 'notifications', 'settings'],
};

export function normalizeRole(role: string | null | undefined): AppRole | null {
  const normalizedRole = (role ?? '').trim().toUpperCase();

  if (normalizedRole === 'ADMIN' || normalizedRole === 'MENTOR' || normalizedRole === 'LEARNER') {
    return normalizedRole;
  }

  return null;
}

export function getSessionRole(): AppRole | null {
  return normalizeRole(getStoredRole());
}

export function getHomeScreenForRole(role: string | null | undefined): ScreenId {
  const normalizedRole = normalizeRole(role);

  return normalizedRole ? HOME_SCREEN_BY_ROLE[normalizedRole] : 'login';
}

export function getVisibleScreensForRole(role: string | null | undefined): ScreenId[] {
  const normalizedRole = normalizeRole(role);

  return normalizedRole ? VISIBLE_SCREENS_BY_ROLE[normalizedRole] : ['login'];
}

export function isScreenAccessible(
  screen: ScreenId,
  role: string | null | undefined,
  token: string | null = getStoredToken(),
): boolean {
  if (!token) {
    return screen === 'login';
  }

  const normalizedRole = normalizeRole(role);

  if (!normalizedRole) {
    return false;
  }

  return VISIBLE_SCREENS_BY_ROLE[normalizedRole].includes(screen);
}