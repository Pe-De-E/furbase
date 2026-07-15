'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, LogOut, User, ClipboardList, CalendarDays } from 'lucide-react'
import { useTranslations } from 'next-intl'
import UserAvatar from './user-avatar'

type Props = {
  name: string | null | undefined
  email: string | null | undefined
  image: string | null | undefined
  isAdmin: boolean
  signOutAction: () => Promise<void>
}

export default function UserMenu({
  name,
  email,
  image,
  isAdmin,
  signOutAction,
}: Props) {
  const t = useTranslations('UserMenu')
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
        onClick={() => setOpen((o) => !o)}
        className="border-0 p-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 rounded-full"
        title="Your account"
      >
        <UserAvatar name={name} email={email} image={image} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {name?.replace(/\s*\(.*\)\s*$/, '')}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{email}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <User className="inline-block mr-2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            {t('profile')}
          </Link>

          <Link
            href="/adoption"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ClipboardList className="inline-block mr-2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            {t('adoption')}
          </Link>

          <Link
            href="/walks"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <CalendarDays className="inline-block mr-2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            {t('walks')}
          </Link>

          {isAdmin && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <LayoutDashboard className="inline-block mr-2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                {t('adminPanel')}
              </Link>
            </div>
          )}

          <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
            <form action={signOutAction}>
              <button className="w-full text-left px-4 py-2 text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <LogOut className="inline-block mr-2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                {t('signOut')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
