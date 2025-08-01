'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type RequireAuthProps = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (user === undefined) {
    // Auth state is still loading — render nothing
    return null;
  }

  if (user === null) {
    // Auth check complete, but not logged in — already redirecting
    return null;
  }

  // Authenticated
  return <>{children}</>;
}
