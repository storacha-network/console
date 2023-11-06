'use client'

import { Logo } from '../brand'
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Authenticator, useKeyring, Space } from '@w3ui/react-keyring'
import { AuthenticationEnsurer } from '../components/Authenticator'
import { SpaceEnsurer } from '../components/SpaceEnsurer'
import { W3APIProvider } from '@/components/W3API'
import { SpaceFinder } from './SpaceFinder'
import { usePathname, useRouter } from 'next/navigation'
import { H2 } from './Text'

const navLinks = [
  { name: 'Terms', href: '/terms' },
  { name: 'Docs', href: '/docs' },
  { name: 'Support', href: 'https://github.com/web3-storage/w3ui/issues' },
]

interface SidebarComponentProps {
  sidebar?: React.ReactNode
}

function Sidebar ({ sidebar = <div></div> }: SidebarComponentProps): JSX.Element {
  const [{space, spaces}] = useKeyring()
  const router = useRouter()
  const pathname = usePathname()  
  const goToSpace = (s: Space) => {
    router.push(`/space/${s.did()}`)
  }
  return (
    <nav className='flex-none w-64 bg-gray-900 lg:bg-gray-900/60 text-white px-4 pb-4 border-r border-gray-800 h-screen'>
      <div className='flex flex-col justify-between h-full'>
        <div>
          <header className='opacity-0 lg:opacity-100'>
            <Logo className='py-8' />
          </header>
          <H2 className='text-white'>Spaces</H2>
          <SpaceFinder spaces={spaces} selected={space} setSelected={goToSpace} />
        </div>
        {sidebar}
        <div className='flex flex-col items-center'>
          <div className='flex flex-row space-x-2'>
            {navLinks.map((link, i) => (
              <a key={i} className='text-xs block text-center mt-2' href={link.href}>{link.name}</a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

interface LayoutComponentProps extends SidebarComponentProps {
  children: React.ReactNode
}

export default function SidebarLayout ({ children }: LayoutComponentProps): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <W3APIProvider uploadsListPageSize={20}>
      <Authenticator className='h-full' as='div'>
        <AuthenticationEnsurer>
          <SpaceEnsurer>
            <div className='flex min-h-full w-full text-white'>
              {/* dialog sidebar for narrow browsers */}
              <Transition.Root show={sidebarOpen} >
                <Dialog onClose={() => setSidebarOpen(false)} as='div' className='relative z-50'>
                  <Transition.Child
                    as={Fragment}
                    enter="transition-opacity duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-400"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                  </Transition.Child>
                  <div className="fixed inset-0 flex justify-left">
                    <Transition.Child
                      as={Fragment}
                      enter="transition duration-200"
                      enterFrom="-translate-x-full"
                      enterTo="translate-x-0"
                      leave="transition duration-400"
                      leaveFrom="translate-x-0"
                      leaveTo="-translate-x-full">
                      <Dialog.Panel>
                        <XMarkIcon className='text-white w-6 h-6 fixed top-2 -right-8' onClick={() => setSidebarOpen(false)} />
                        <Sidebar />
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </Dialog>
              </Transition.Root>

              {/* static sidebar for wide browsers */}
              <div className='hidden lg:block'>
                <Sidebar />
              </div>
              <div className='w-full h-screen overflow-scroll text-white'>
                {/* top nav bar for narrow browsers, mainly to have a place to put the hamburger */}
                <div className='lg:hidden flex justify-between pt-4 px-4'>
                  <Bars3Icon className='w-6 h-6' onClick={() => setSidebarOpen(true)} />
                  <Logo className='w-full' />
                </div>
                <main className='grow text-black p-4'>
                  {children}
                </main>
              </div>
            </div>
          </SpaceEnsurer>
        </AuthenticationEnsurer>
      </Authenticator>
    </W3APIProvider>
  )
}
