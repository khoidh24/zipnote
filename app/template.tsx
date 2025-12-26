import FloatingSidebar from '@/components/sidebar'
import NextTopLoader from 'nextjs-toploader'
import { ReactNode } from 'react'

export default function RootTemplate({ children }: { children: ReactNode }) {
  return (
    <>
      <NextTopLoader />
      <FloatingSidebar>{children}</FloatingSidebar>
    </>
  )
}
