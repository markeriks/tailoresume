import React, { Suspense } from 'react';
import Verify from './Verify';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Verify />
    </Suspense>
  );
}