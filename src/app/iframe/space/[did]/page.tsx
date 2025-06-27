'use client'

import { UploadsList } from '@/components/UploadsList'
import { useW3, UnknownLink, UploadListSuccess, Authenticator } from '@w3ui/react'
import useSWR from 'swr'
import { useRouter, usePathname } from 'next/navigation'
import { createUploadsListKey } from '@/cache'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { logAndCaptureError } from '@/sentry'
import { AuthenticationEnsurer } from '@/components/Authenticator'
import { SpaceEnsurer } from '@/components/SpaceEnsurer'
import { MaybePlanGate } from '@/components/PlanGate'
import IframeAuthenticator from '@/components/IframeAuthenticator'

const pageSize = 15

interface PageProps {
  params: {
    did: string
  },
  searchParams: {
    cursor: string
    pre: string
  }
}

export default function IframeSpacePage({ params, searchParams }: PageProps): JSX.Element {
  return (
    <IframeAuthenticator>
      <AuthenticationEnsurer>
        <MaybePlanGate>
          <SpaceEnsurer>
            <SpacePageContent params={params} searchParams={searchParams} />
          </SpaceEnsurer>
        </MaybePlanGate>
      </AuthenticationEnsurer>
    </IframeAuthenticator>
  )
}

function SpacePageContent({ params, searchParams }: PageProps): JSX.Element {
  const [{ client, spaces }] = useW3()
  const spaceDID = decodeURIComponent(params.did)
  const space = spaces.find(s => s.did() === spaceDID)

  const key = space ? createUploadsListKey(space.did(), searchParams.cursor, searchParams.pre === 'true') : ''
  const { data: uploads, isLoading, isValidating, mutate } = useSWR<UploadListSuccess|undefined>(key, {
    fetcher: async () => {
      if (!client || !space) return

      if (client.currentSpace()?.did() !== space.did()) {
        await client.setCurrentSpace(space.did())
      }

      return await client.capability.upload.list({
        cursor: searchParams.cursor,
        pre: searchParams.pre === 'true',
        size: pageSize
      })
    },
    onError: logAndCaptureError,
    keepPreviousData: true
  })

  const router = useRouter()
  const pathname = usePathname()

  if (!space) return <div className="p-6"><div>Space not found</div></div>

  const handleSelect = (root: UnknownLink) => router.push(`${pathname}/root/${root}`)
  const handleNext = uploads?.after && (uploads.results.length === pageSize)
    ? () => router.push(`${pathname}?cursor=${uploads.after}`)
    : undefined
  const handlePrev = searchParams.cursor && uploads?.before
    ? () => router.push(`${pathname}?cursor=${uploads.before ?? ''}&pre=true`)
    : undefined
  const handleRefresh = () => mutate()

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-4">
        <Breadcrumbs space={space.did()} />
      </div>
      <UploadsList
        space={space}
        uploads={uploads?.results ?? []}
        loading={isLoading}
        validating={isValidating}
        onSelect={handleSelect}
        onNext={handleNext}
        onPrev={handlePrev}
        onRefresh={handleRefresh}
      />
    </div>
  )
} 