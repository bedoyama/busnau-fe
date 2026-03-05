'use client'
import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
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