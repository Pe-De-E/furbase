'use client'

const AVATAR_COLORS = [
  '#4285F4',
  '#EA4335',
  '#34A853',
  '#FBBC04',
  '#FF6D00',
  '#7B1FA2',
  '#0097A7',
  '#C62828',
]

export function avatarColor(str: string | null | undefined): string {
  const code = (str ?? '?').charCodeAt(0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

type Props = {
  name: string | null | undefined
  email: string | null | undefined
  image: string | null | undefined
  size?: number
}

export default function UserAvatar({ name, email, image, size = 28 }: Props) {
  const initial = (name ?? email ?? '?')[0].toUpperCase()

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: avatarColor(name ?? email),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...(image ? { backgroundImage: `url("${image}")` } : {}),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.43,
        fontWeight: 500,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {!image && initial}
    </div>
  )
}
