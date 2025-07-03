'use client'

import { useIframe } from '@/contexts/IframeContext'
import { useW3, Authenticator } from '@w3ui/react'
import { useEffect, useState, ReactNode } from 'react'
import { Logo } from '@/brand'

interface IframeAuthenticatorProps {
  children: ReactNode
}

export default function IframeAuthenticator({ children }: IframeAuthenticatorProps) {
  const { isIframe, isClient, parentUser, sendMessageToParent } = useIframe()
  const [{ accounts }] = useW3()
  const [authState, setAuthState] = useState<'pending' | 'authenticating' | 'authenticated' | 'failed'>('pending')
  const [error, setError] = useState<string | null>(null)
  
  const isAuthenticated = accounts.length > 0

  // Programmatic DMAIL authentication
  useEffect(() => {
    const authenticateWithDmail = async () => {
      if (!parentUser?.email || authState !== 'pending' || isAuthenticated) return

      try {
        setAuthState('authenticating')
        sendMessageToParent({
          type: 'AUTH_STATUS',
          status: 'authenticating',
          email: parentUser.email
        })

        // Step 1: Validate user with DMAIL API (simulated)
        console.log('🔐 Starting DMAIL OAuth authentication for:', parentUser.email)
        const dmailValidation = await validateDmailUser(parentUser)
        if (!dmailValidation.valid) {
          throw new Error(`User ${parentUser.email} not found in DMAIL system`)
        }

        // Step 2: Simulate programmatic OAuth that bypasses email verification
        await simulateProgrammaticAuth(parentUser.email)
        
        setAuthState('authenticated')
        sendMessageToParent({
          type: 'AUTH_STATUS',
          status: 'authenticated',
          email: parentUser.email
        })

      } catch (err) {
        console.error('DMAIL authentication failed:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
        setAuthState('failed')
        sendMessageToParent({
          type: 'AUTH_STATUS',
          status: 'failed',
          email: parentUser.email,
          error: err instanceof Error ? err.message : 'Authentication failed'
        })
      }
    }

    if (parentUser?.email && !isAuthenticated) {
      authenticateWithDmail()
    }
  }, [parentUser, authState, isAuthenticated, sendMessageToParent])

  // Monitor authentication state and notify parent
  useEffect(() => {
    if (isAuthenticated && parentUser) {
      console.log('✅ User authenticated successfully!')
      sendMessageToParent({
        type: 'AUTH_STATUS',
        status: 'authenticated',
        email: parentUser.email
      })
    }
  }, [isAuthenticated, parentUser, sendMessageToParent])

  // Notify parent when user credentials are received
  useEffect(() => {
    if (parentUser && !isAuthenticated) {
      sendMessageToParent({
        type: 'AUTH_RECEIVED',
        user: parentUser
      })
    }
  }, [parentUser, isAuthenticated, sendMessageToParent])

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If not in iframe, use regular authenticator
  if (!isIframe) {
    return <Authenticator>{children}</Authenticator>
  }

  // If no parent user provided, show waiting state
  if (!parentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Waiting for Authentication
          </h3>
          <p className="text-gray-500">
            Waiting for user credentials from email provider...
          </p>
        </div>
      </div>
    )
  }

  // Show authentication progress
  if (authState === 'authenticating') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Authenticating with DMAIL
        </h3>
        <p className="text-gray-600">
          Validating {parentUser.email}...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This should take just a moment
        </p>
      </div>
    )
  }

  // Show authentication failure
  if (authState === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-600 text-sm">✗</span>
            </div>
            <h3 className="text-lg font-medium text-red-800">Authentication Failed</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => {
              setAuthState('pending')
              setError(null)
            }}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry Authentication
          </button>
        </div>
      </div>
    )
  }

  // If user is authenticated OR we completed our simulation, show the console
  if (isAuthenticated || authState === 'authenticated') {
    return <Authenticator>{children}</Authenticator>
  }

  // Default: show preparation state
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8">
        <Logo className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Preparing Workspace
        </h3>
        <p className="text-gray-500">
          Setting up your Storacha workspace...
        </p>
      </div>
    </div>
  )
}

/**
 * Validate user exists in DMAIL system
 */
async function validateDmailUser(user: { email: string, id: string, name?: string }): Promise<{ valid: boolean, plan?: string }> {
  // Simulate API call to DMAIL
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Simulate validation logic
  if (user.email.endsWith('@dmail.ai')) {
    console.log('✅ User validated with DMAIL API:', user.email)
    return { valid: true, plan: 'pro' }
  }
  
  throw new Error('User not found in DMAIL system')
}

/**
 * Simulate programmatic authentication that would happen after DMAIL OAuth validation
 */
async function simulateProgrammaticAuth(email: string) {
  console.log('🔐 Simulating DMAIL OAuth backend flow for:', email)
  
  // Simulate the OAuth flow timing
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  console.log('✅ Programmatic authentication completed for:', email)
  console.log('📝 In production, this would:')
  console.log('   1. Validate user with DMAIL API')
  console.log('   2. Issue Access.confirm delegation on backend')
  console.log('   3. Use w3up client to claim delegated access')
  console.log('   4. User would be authenticated with Storacha')
} 