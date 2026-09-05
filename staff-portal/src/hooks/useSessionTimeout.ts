import { useEffect, useRef } from 'react';
import { useStaffAuth } from '../stores/staffAuthStore';
import { securityLogger } from '../services/security/securityLogger';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes idle limit

/**
 * Session Idle Timeout Hook — Wunabuy Staff Portal (OWASP A04:2025 Mitigation)
 * 
 * Automatically terminates authenticated staff sessions after 15 minutes of inactivity
 * to prevent physical access token exploitation on shared office terminals.
 */
export function useSessionTimeout() {
  const { isAuthenticated, logout, user } = useStaffAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isAuthenticated) {
      timerRef.current = setTimeout(() => {
        // Log session timeout security event
        securityLogger.logEvent(
          {
            action_code: 'SESSION_IDLE_TIMEOUT',
            action_description: `Staff session for employee ${user?.employee_id || 'N/A'} auto-terminated after 15 minutes of inactivity.`,
            security_level: 'WARNING',
          },
          user?.full_name || 'Staff User',
          user?.staff_department_role || 'STAFF'
        );

        logout();
        alert('🔒 Session Timeout: You have been logged out due to 15 minutes of inactivity for security compliance.');
        window.location.href = '/login';
      }, IDLE_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    const handleUserActivity = () => {
      resetTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Start timer on mount
    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated]);
}
