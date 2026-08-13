'use server'

import { auth } from '@/auth'
import { db, feedback } from '@furbase/db'
import { redirect } from 'next/navigation'

export async function submitFeedback(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/api/auth/signin')

  const message = (formData.get('message') as string | null)?.trim()
  if (!message) return

  await db.insert(feedback).values({ userId: session.user.id, message })

  redirect('/feedback?sent=1')
}
