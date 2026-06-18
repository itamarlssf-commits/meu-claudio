'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { subscribeUsuario } from '@/lib/ponto-firebase';
import { emailEhAdmin } from '@/lib/ponto-logic';
import { usePontoStore } from '@/store/use-ponto-store';

export default function usePontoAuth() {
  const setUser = usePontoStore((s) => s.setUser);
  const setAuthReady = usePontoStore((s) => s.setAuthReady);
  const setUsuario = usePontoStore((s) => s.setUsuario);
  const setUsuarioReady = usePontoStore((s) => s.setUsuarioReady);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthReady(true);

      if (!user) {
        setUsuario(null);
        setUsuarioReady(true);
        return;
      }

      setUsuarioReady(false);
      const unsubUsuario = subscribeUsuario(user.uid, (usuario) => {
        if (usuario) {
          setUsuario(usuario);
        } else if (emailEhAdmin(user.email)) {
          // Fallback: admin definido por env, sem doc em ponto_usuarios.
          setUsuario({
            uid: user.uid,
            papel: 'admin',
            nome: user.email ?? 'Administrador',
          });
        } else {
          setUsuario(null);
        }
        setUsuarioReady(true);
      });
      return () => unsubUsuario();
    });

    return () => unsubAuth();
  }, [setUser, setAuthReady, setUsuario, setUsuarioReady]);
}
