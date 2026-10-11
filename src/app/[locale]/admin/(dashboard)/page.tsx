'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { getStats } from '@/lib/api';

type RecentInquiry = {
  id: number;
  name: string;
  email: string;
  message: string;
  carpet_title?: string | null;
  created_at: string;
};

type Stats = {
  carpets: number;
  available: number;
  reserved: number;
  sold: number;
  categories: number;
  inquiries: number;
  users: number;
  recent_inquiries: RecentInquiry[];
};

export default function AdminOverviewPage() {
  const t = useTranslations('Admin');
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  if (error) return <div className="ad-empty">{t('common.error')}</div>;
  if (!stats) return <div className="ad-loading">{t('common.loading')}</div>;

  const cards = [
    {
      label: t('overview.carpets'),
      value: stats.carpets,
      sub: `${stats.available} ${t('overview.available')}`,
    },
    { label: t('overview.available'), value: stats.available },
    { label: t('overview.reserved'), value: stats.reserved },
    { label: t('overview.sold'), value: stats.sold },
    { label: t('overview.categories'), value: stats.categories },
    { label: t('overview.inquiries'), value: stats.inquiries },
    { label: t('overview.users'), value: stats.users },
  ];

  return (
    <>
      <div>
        <h2 className="ad-display" style={{ fontSize: '1.5rem' }}>
          {t('overview.title')}
        </h2>
        <p className="ad-muted" style={{ marginTop: '0.3rem' }}>
          {t('overview.subtitle')}
        </p>
      </div>

      <div className="ad-stats">
        {cards.map((card) => (
          <div key={card.label} className="ad-stat">
            <div className="ad-stat__label">{card.label}</div>
            <div className="ad-stat__value ad-display">{card.value}</div>
            {card.sub && <div className="ad-stat__sub">{card.sub}</div>}
          </div>
        ))}
      </div>

      <section className="ad-card">
        <div className="ad-card__head">
          <h3 className="ad-card__title ad-display">
            {t('overview.recentInquiries')}
          </h3>
        </div>
        {stats.recent_inquiries.length === 0 ? (
          <div className="ad-empty">{t('overview.noInquiries')}</div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>{t('inquiries.name')}</th>
                  <th>{t('inquiries.email')}</th>
                  <th>{t('inquiries.carpet')}</th>
                  <th>{t('inquiries.date')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td>{inq.name}</td>
                    <td className="ad-muted">{inq.email}</td>
                    <td>{inq.carpet_title || t('inquiries.general')}</td>
                    <td className="ad-muted">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
