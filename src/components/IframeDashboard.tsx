'use client'

import { useW3, Space } from '@w3ui/react'
import { DidIcon } from '@/components/DidIcon'
import Link from 'next/link'
import { H1, H2 } from '@/components/Text'
import { ReactNode } from 'react'
import { AuthenticationEnsurer } from '@/components/Authenticator'
import { SpaceEnsurer } from '@/components/SpaceEnsurer'
import { MaybePlanGate } from '@/components/PlanGate'
import IframeAuthenticator from '@/components/IframeAuthenticator'

export default function IframeDashboard(): ReactNode {
  return (
    <IframeAuthenticator>
      <AuthenticationEnsurer>
        <MaybePlanGate>
          <SpaceEnsurer>
            <SpacePage />
          </SpaceEnsurer>
        </MaybePlanGate>
      </AuthenticationEnsurer>
    </IframeAuthenticator>
  )
}

function SpacePage(): ReactNode {
  const [{ spaces }] = useW3()

  if (spaces.length === 0) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <H1 className="text-xl mb-4">Welcome to Storacha Workspaces</H1>
        <p className="text-gray-600">
          No spaces found. Create your first space to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <H1 className="text-xl mb-2">Your Workspaces</H1>
      <H2 className="text-base mb-4 text-gray-600">Select a Space to Manage</H2>
      <div className='border rounded-lg border-hot-red bg-white shadow-sm'>
        {spaces.map(s => <Item space={s} key={s.did()} />)}
      </div>
    </div>
  )
}

function Item({ space }: { space: Space }) {
  return (
    <Link 
      href={`/iframe/space/${space.did()}`} 
      className='flex flex-row items-start gap-4 p-4 text-left hover:bg-hot-yellow-light border-b last:border-0 border-hot-red first:rounded-t-2xl last:rounded-b-2xl'
    >
      <DidIcon did={space.did()} />
      <div className='grow overflow-hidden whitespace-nowrap text-ellipsis'>
        <span className='font-epilogue text-lg text-hot-red leading-5 m-0'>
          {space.name || 'Untitled'}
        </span>
        <span className='font-mono text-xs block'>
          {space.did()}
        </span>
      </div>
    </Link>
  )
} 