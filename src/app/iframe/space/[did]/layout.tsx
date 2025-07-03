import { PropsWithChildren, ReactNode } from 'react'
import IframeCompactSidebar from '@/components/IframeCompactSidebar'

export const runtime = 'edge'

interface LayoutProps extends PropsWithChildren {
  params: {
    did: string
  }
}

export default function IframeSpaceLayout({ children }: LayoutProps): ReactNode {
  return (
    <div className="flex h-full min-h-0">
      <IframeCompactSidebar />
      <div className="flex-1 overflow-auto bg-white min-w-0">
        {children}
      </div>
    </div>
  )
} 