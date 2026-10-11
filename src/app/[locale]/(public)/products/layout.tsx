import React from 'react';

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      products layout
      {children}
    </div>
  );
}

export default layout;
