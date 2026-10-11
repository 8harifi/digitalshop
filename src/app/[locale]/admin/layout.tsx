import '@/styles/admin.css';
import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/lib/auth';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const dir = locale === 'en' ? 'ltr' : 'rtl';

  return (
    <AuthProvider>
      <div className="ad-root" dir={dir}>
        {children}
      </div>
    </AuthProvider>
  );
}
