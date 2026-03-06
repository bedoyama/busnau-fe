'use client'
import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const shouldMock = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' ||
      (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCKS !== 'false');

    if (shouldMock) {
      import('../lib/mocks').then(async ({ initMocks }) => {
        await initMocks()
        setFetching(false)
      })
    } else {
      setFetching(false)
    }
  }, [])

  if (fetching) return null

  return <>{children}</>
}