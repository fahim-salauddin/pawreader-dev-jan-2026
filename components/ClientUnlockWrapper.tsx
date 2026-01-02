'use client';
import { useEffect, useState } from 'react';
import { isUnlocked } from '@/lib/unlockCodes';
import UnlockModal from './UnlockModal';

interface Props {
  children: React.ReactNode;
  isPremium: boolean;
} 

export default function ClientUnlockWrapper({ children }: Props) {
  const [isClientUnlocked, setIsClientUnlocked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsClientUnlocked(isUnlocked());
  }, []);

  if (!isMounted) return <>{children}</>; // Server render

  if (!isClientUnlocked) {
    return (
      <>
        {children}
        <UnlockModal />
      </>
    );
  }

  return <>{children}</>;
}
