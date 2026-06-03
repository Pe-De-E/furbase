import { auth } from '@/auth'
import MatcherWizard from './wizard'

export default async function MatcherPage() {
  const session = await auth()
  const userId = session?.user?.id ?? null

  return <MatcherWizard userId={userId} />
}
