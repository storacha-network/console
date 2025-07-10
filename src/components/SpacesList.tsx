import { Space } from '@w3ui/react'
import { LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { DidIcon } from './DidIcon'
import Link from 'next/link'

interface SpaceListProps {
  spaces: Space[]
  type: 'public' | 'private'
}

export function SpacesList({ spaces, type }: SpaceListProps) {
  if (spaces.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No {type} spaces yet.</p>
        <Link 
          href="/space/create" 
          className="text-hot-red hover:underline"
        >
          Create your first {type} space
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg border rounded-2xl border-hot-red bg-white">
      {spaces.map(space => (
        <SpaceItem key={space.did()} space={space} type={type} />
      ))}
    </div>
  )
}

interface SpaceItemProps {
  space: Space
  type: 'public' | 'private'
}

function SpaceItem({ space, type }: SpaceItemProps) {
  const Icon = type === 'private' ? LockClosedIcon : GlobeAltIcon
  
  return (
    <Link 
      href={`/space/${space.did()}`} 
      className="flex flex-row items-start gap-4 p-4 text-left hover:bg-hot-yellow-light border-b last:border-0 border-hot-red first:rounded-t-2xl last:rounded-b-2xl"
    >
      <div className="flex items-center gap-2">
        <DidIcon did={space.did()} />
        <Icon className="w-4 h-4 text-hot-red" />
      </div>
      <div className="grow overflow-hidden whitespace-nowrap text-ellipsis">
        <div className="flex items-center gap-2">
          <span className="font-epilogue text-lg text-hot-red leading-5 m-0">
            {space.name || 'Untitled'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            type === 'private' 
              ? 'bg-hot-red text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {type === 'private' ? 'Private' : 'Public'}
          </span>
        </div>
        <span className="font-mono text-xs block">
          {space.did()}
        </span>
      </div>
    </Link>
  )
} 