import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect('/api/auth/signin')
  if (session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-zinc-900">Access denied</p>
          <p className="text-zinc-500 mt-2">You don't have permission to access this area.</p>
          <a href="/" className="mt-4 inline-block text-sm text-zinc-900 underline">Back to home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-zinc-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
              ← Public site
            </Link>
            <span className="text-zinc-600">|</span>
            <Link href="/admin/animals" className="text-sm font-medium hover:text-zinc-300 transition-colors">
              Animals
            </Link>
          </div>
          <span className="text-xs text-zinc-500">Admin — {session.user.email}</span>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  )
}
