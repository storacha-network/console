'use client'

import { ReactNode } from 'react'
import { useW3, PlanGetSuccess, SpaceDID } from '@w3ui/react'
import useSWR from 'swr'
import { GB, TB, filesize } from '@/lib'

const BarHeight = 10

const Plans: Record<`did:${string}`, { name: string, limit: number }> = {
  'did:web:starter.web3.storage': { name: 'Starter', limit: 5 * GB },
  'did:web:lite.web3.storage': { name: 'Lite', limit: 100 * GB },
  'did:web:business.web3.storage': { name: 'Business', limit: 2 * TB }
}

export function UsageBar (): ReactNode {
  const [{ client, accounts }] = useW3()
  // TODO: introduce account switcher
  const account = accounts[0]

  const { data: plan } = useSWR<PlanGetSuccess|undefined>(`/plan/${account?.did() ?? ''}`, {
    fetcher: async () => {
      if (!account) return
      const result = await account.plan.get()
      if (result.error) throw new Error('getting plan', { cause: result.error })
      return result.ok
    },
    onError: err => console.error(err.message, err.cause)
  })

  const { data: usage } = useSWR<Record<SpaceDID, number>|undefined>(`/usage/${account ?? ''}`, {
    fetcher: async () => {
      const usage: Record<SpaceDID, number> = {}
      if (!account || !client) return

      const now = new Date()
      const period = {
        // we may not have done a snapshot for this month _yet_, so get report
        // from last month -> now
        from: startOfLastMonth(now),
        to: now,
      }

      const subscriptions = await client.capability.subscription.list(account.did())
      for (const { consumers } of subscriptions.results) {
        for (const space of consumers) {
          const result = await client.capability.usage.report(space, period)
          for (const [, report] of Object.entries(result)) {
            usage[report.space] = report.size.final
          }
        }
      }
      return usage
    },
    onError: err => console.error(err.message, err.cause)
  })
  
  const allocated = Object.values(usage ?? {}).reduce((total, n) => total + n, 0)
  const limit = plan?.product ? Plans[plan.product]?.limit : null

  return (
    <div className='w-full'>
      {plan?.product ? (
        <div className='lg:text-right text-xs tracking-wider font-mono'>
          Plan: <strong>{Plans[plan.product]?.name ?? plan.product}</strong> <a className='underline' href='mailto:support@web3.storage?subject=How%20to%20change%20my%20payment%20plan?' title='Automated support for switching plans is currently in progress. to change your plan, please email support@web3.storage.'>change</a>
        </div>
      ) : null}
      {usage && limit ? (
        <>
          <div className='rounded-full bg-white/20 overflow-hidden whitespace-nowrap outline outline-white/40 mt-3 mb-3 shadow-inner' style={{ fontSize: 0, height: BarHeight }}>
            {Object.entries(usage).sort((a, b) => b[1] - a[1]).map(([space, total]) => {
              return (
                <div
                  key={space}
                  style={{ width: `${total/limit * 100}%`, height: BarHeight }}
                  className='bg-white/80 hover:bg-white bg-clip-padding inline-block border-r last:border-r-0 border-transparent'
                  title={`${space}: ${filesize(total)}`}
                />
              )
            })}
          </div>
          <div className='lg:text-right text-xs tracking-wider uppercase font-bold font-mono'>
            <big>{filesize(allocated)}</big>
            <small> of {filesize(limit)}</small>
          </div>
        </>
      ) : null}
    </div>
  )
}

const startOfMonth = (now: string|number|Date) => {
  const d = new Date(now)
  d.setUTCDate(1)
  d.setUTCHours(0)
  d.setUTCMinutes(0)
  d.setUTCSeconds(0)
  d.setUTCMilliseconds(0)
  return d
}

const startOfLastMonth = (now: string|number|Date) => {
  const d = startOfMonth(now)
  d.setUTCMonth(d.getUTCMonth() - 1)
  return d
}
