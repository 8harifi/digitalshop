'use client';

import { useEffect } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Tags,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth';

const NAV = [
  { href: '/admin', key: 'overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', key: 'products', icon: Package, exact: false },
  { href: '/admin/categories', key: 'categories', icon: Tags, exact: false },
  { href: '/admin/inquiries', key: 'inquiries', icon: Mail, exact: false },
  { href: '/admin/users', key: 'users', icon: Users, exact: false },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Admin');
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="ad-loading">{t('common.loading')}</div>;
  }

  const activeKey =
    NAV.find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    )?.key ?? 'overview';

  const onLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  return (
    <div className="ad-shell">
      <aside className="ad-sidebar">
        <div className="ad-brand">
          <span className="ad-brand__mark">
            <span>KH</span>
          </span>
          <span className="ad-brand__name ad-display">{t('brand')}</span>
        </div>

        <nav className="ad-nav">
          {NAV.map(({ href, key, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`ad-nav__link ${active ? 'is-active' : ''}`}
              >
                <Icon size={18} strokeWidth={1.7} />
                <span>{t(`nav.${key}`)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ad-sidebar__foot">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.username}
          </span>
          <button
            type="button"
            className="ad-btn ad-btn--ghost ad-btn--sm"
            onClick={onLogout}
          >
            <LogOut size={15} strokeWidth={1.7} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <div className="ad-main">
        <header className="ad-topbar">
          <h1 className="ad-display ad-topbar__title">
            {t(`nav.${activeKey}`)}
          </h1>
          <Link href="/" className="ad-btn ad-btn--ghost ad-btn--sm">
            {t('nav.viewSite')}
          </Link>
        </header>
        <main className="ad-content">{children}</main>
      </div>
    </div>
  );
}
