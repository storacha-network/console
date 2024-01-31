'use client'

import { usePlan } from "@/hooks"
import { useW3, DID } from "@w3ui/react"
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import DefaultLoader from "@/components/Loader"
import { useState } from "react"

interface PlanSectionProps {
  planID: DID
  planName: string
  flatFee: number
  flatFeeAllotment: number
  perGbFee: number
}

const planRanks: Record<string, number> = {
  'did:web:starter.web3.storage': 0,
  'did:web:lite.web3.storage': 1,
  'did:web:business.web3.storage': 2
}

const buttonText = (currentPlan: string, newPlan: string) => (planRanks[currentPlan] > planRanks[newPlan]) ? 'Downgrade' : 'Upgrade'


function PlanSection ({ planID, planName, flatFee, flatFeeAllotment, perGbFee }: PlanSectionProps) {
  const [{ accounts }] = useW3()
  const { data: plan, setPlan, isLoading } = usePlan(accounts[0])
  const currentPlanID = plan?.product
  const isCurrentPlan = currentPlanID === planID
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false)
  async function selectPlan (selectedPlanID: DID) {
    setIsUpdatingPlan(true)
    await setPlan(selectedPlanID)
    setIsUpdatingPlan(false)
  }
  return (
    <div className={`flex flex-col items-center rounded border-2 border-solid border-slate-800 w-96 p-8 ${isCurrentPlan ? 'bg-blue-800/10' : 'bg-slate-800/10'}`}>
      <div className='text-2xl mb-6 flex flex-row justify-between w-full'>
        <div className='font-bold'>{planName}</div>
        <div>
          <span className='font-bold'>${flatFee}</span><span className='text-slate-600'>/mo</span>
        </div>
      </div>
      <div className='flex flex-row self-start space-x-2 mb-4'>
        <div className='pt-1'>
          <CheckCircleIcon className='w-6 h-6 font-bold' />
        </div>
        <div className='flex flex-col'>
          <div className='text-xl font-bold'>{flatFeeAllotment}GB storage</div>
          <div>Additional at ${perGbFee}/GB per month</div>
        </div>
      </div>
      <div className='flex flex-row self-start space-x-2 mb-8'>
        <div className='pt-1'>
          <CheckCircleIcon className='w-6 h-6 font-bold' />
        </div>
        <div className='flex flex-col'>
          <div className='text-xl font-bold'>{flatFeeAllotment}GB egress per month</div>
          <div>Additional at ${perGbFee}/GB per month</div>
        </div>
      </div>
      {
        (isLoading || isUpdatingPlan || !currentPlanID) ? (
          <DefaultLoader className='h-6 w-6' />
        ) : (
          isCurrentPlan ? (
            <div className='h-4'>
              {(currentPlanID === planID) && (
                <h5 className='font-bold'>Current Plan</h5>
              )}
            </div>
          ) : (
            <button className={`text-white bg-slate-800 hover:bg-blue-800 rounded py-2 px-8 text-sm font-medium transition-colors ease-in`}
              disabled={isCurrentPlan || isLoading} onClick={() => selectPlan(planID)}>{currentPlanID && buttonText(currentPlanID, planID)}</button>
          )
        )
      }
    </div >
  )
}

export default function Plans () {


  return (
    <div className='py-8 flex flex-col items-center'>
      <h1 className='text-2xl font-mono mb-8 font-bold'>Plans</h1>
      <p className='mb-4'>Pick the price plan that works for you.</p>
      <div className='flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2'>
        <PlanSection planID='did:web:starter.web3.storage' planName='Starter' flatFee={0} flatFeeAllotment={5} perGbFee={0.15} />
        <PlanSection planID='did:web:lite.web3.storage' planName='Lite' flatFee={10} flatFeeAllotment={100} perGbFee={0.05} />
        <PlanSection planID='did:web:business.web3.storage' planName='Business' flatFee={100} flatFeeAllotment={2000} perGbFee={0.03} />
      </div>
    </div>
  )
}