import { auth } from '@/auth'
import Header from '@/components/header'
import MatcherWizard from './wizard'

export default async function MatcherPage() {
  const session = await auth()
  const userId = session?.user?.id ?? null

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Header />
      <MatcherWizard userId={userId} />
    </div>
  )
}
