import md5 from 'blueimp-md5'

export function DidIcon({ did, width = 10, display = 'block' }: { did: string, width?: number, display?: 'block'|'inline-block' }): JSX.Element {
  const src = `https://www.gravatar.com/avatar/${md5(did)}?d=identicon`
  return (
    <img
      title={did}
      alt={`gravatar for did ${did}`}
      src={src}
      className={`w-${width} ${display} grayscale border-solid border-black border rounded-xl`}
    />
  )
}
