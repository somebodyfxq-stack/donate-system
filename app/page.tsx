import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import { SignInButton } from '../components/sign-in-button'
import { Button } from '../components/ui/button'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const isAuthorized = Boolean(session)

  return (
    <main className="flex min-h-screen items-center justify-center gap-4">
      {isAuthorized ? (
        <Button asChild>
          <Link href="/dashboard">Кабінет</Link>
        </Button>
      ) : (
        <>
          <Button>Створити сторінку</Button>
          <SignInButton />
        </>
      )}
    </main>
  )
}
