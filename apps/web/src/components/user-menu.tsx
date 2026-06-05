'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

type Props = {
  name:           string | null | undefined
  email:          string | null | undefined
  image:          string | null | undefined
  isAdmin:        boolean
  signOutAction:  () => Promise<void>
}

const AVATAR_COLORS = [
  '#4285F4', '#EA4335', '#34A853', '#FBBC04',
  '#FF6D00', '#7B1FA2', '#0097A7', '#C62828',
]

function avatarColor(str: string | null | undefined): string {
  const code = (str ?? '?').charCodeAt(0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

export default function UserMenu({ name, email, image, isAdmin, signOutAction }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          backgroundColor: avatarColor(name ?? email),
          ...(image ? { backgroundImage: `url("${image}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
        }}
        className="w-7 h-7 rounded-full shrink-0 border-0 p-0 flex items-center justify-center text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1"
        title="Your account"
      >
        {(name ?? email ?? '?')[0].toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-zinc-100 shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-zinc-100 mb-1">
            <p className="text-sm font-medium text-zinc-900 truncate">{name}</p>
            <p className="text-xs text-zinc-400 truncate">{email}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Profile
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <LayoutDashboard className="inline-block mr-2 w-3.5 h-3.5 text-zinc-400" />
              Admin panel
            </Link>
          )}

          <div className="border-t border-zinc-100 mt-1 pt-1">
            <form action={signOutAction}>
              <button className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
