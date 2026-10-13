export default function Avatar({
  name,
  url,
  size,
}: {
  name: string | null
  url: string | null
  size: number
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name || 'Profile photo'}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }

  const words = name?.trim().split(/\s+/).filter(Boolean) ?? []
  const initials = words.length === 0
    ? '?'
    : words.length === 1
      ? words[0][0]
      : `${words[0][0]}${words[words.length - 1][0]}`

  return (
    <div
      className="rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials.toUpperCase()}
    </div>
  )
}
