import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const t = await getTranslations('Common');
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        color: '#d4b483',
      }}
    >
      {t('loading')}
    </div>
  );
}
