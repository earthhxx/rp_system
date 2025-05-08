// components/UseParams.tsx

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function StatusReader({ onGetproductOrderNo }: { onGetproductOrderNo: (value: string | null) => void }) {
  const searchParams = useSearchParams();
  const productOrderNo = searchParams.get('productOrderNo');

  useEffect(() => {
    onGetproductOrderNo(productOrderNo);
  }, [productOrderNo]);

  return null;
}
