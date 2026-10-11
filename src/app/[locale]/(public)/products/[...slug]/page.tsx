import React from 'react';

async function page({ params }: { params: Promise<{ id: string }> }) {
  const data = await params;

  return <div>{data.id}</div>;
}

export default page;
