'use client';

import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, subscribeData, saveData as fbSaveData } from '@/lib/firebase';
import { useAppStore } from '@/store/use-app-store';
import { loadData } from '@/lib/business-logic';

export default function useAuth() {
  const setUser = useAppStore((s) => s.setUser);
  const setAuthReady = useAppStore((s) => s.setAuthReady);
  const setData = useAppStore((s) => s.setData);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const skipNextWrite = useRef(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthReady(true);

      if (!user) {
        setSyncStatus('offline');
        return;
      }

      setSyncStatus('connecting');

      const unsubData = subscribeData((remoteData) => {
        if (skipNextWrite.current) {
          skipNextWrite.current = false;
          return;
        }

        if (remoteData) {
          setSyncStatus('live');
          setData(remoteData);
        } else {
          // No remote data — upload local data
          const local = loadData();
          skipNextWrite.current = true;
          fbSaveData(local, user.email || '')
            .then(() => setSyncStatus('live'))
            .catch(() => setSyncStatus('offline'));
        }
      });

      return () => {
        unsubData();
      };
    });

    return () => {
      unsubAuth();
    };
  }, [setUser, setAuthReady, setData, setSyncStatus]);
}
