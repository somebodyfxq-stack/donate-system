import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { Button } from '../components/ui/button'

export default async function HomePage() {
  const session = await getServerSession()
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
          <Button variant="secondary">Увійти</Button>
        </>
      )}
    </main>
  )
}
