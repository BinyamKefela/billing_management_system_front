'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export function useSuperUserCheck(redirectTo: string = '/auth/unauthorized') {
  const router = useRouter();

  useEffect(() => {
    const is_superuser = Cookies.get('is_superuser');
    if (is_superuser === 'true') {
      console.log('User is superuser, bypassing biller check ');
      return;
    }
    console.log('Checking biller status...');

    const isSuperuser = Cookies.get('is_superuser');

    if (isSuperuser !== 'true') {
      console.log('User is not a superuser, redirecting...');
      router.push(redirectTo);
    } else {
      console.log('User is a superuser ');
    }
  }, [redirectTo, router]);

  return null;
}
