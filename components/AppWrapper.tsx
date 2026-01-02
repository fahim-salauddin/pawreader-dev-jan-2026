'use client';
import { useEffect, useState } from 'react';
import { isUnlocked } from '@/lib/unlockCodes';
import UnlockModal from './UnlockModal';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-900">{children}</div>;
  }

  return (
    <>
      {children}
      {!isUnlocked() && <UnlockModal />}
    </>
  );
}
