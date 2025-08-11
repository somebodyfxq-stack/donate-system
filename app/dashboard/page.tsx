import Link from 'next/link'
import { parseAsStringEnum } from 'nuqs'
import { prisma } from '../../lib/prisma'
import type { Donation, User, VideoRequest } from '@prisma/client'
import { Button } from '../../components/ui/button'

interface DashboardPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const tab = parseAsStringEnum(['my', 'donations', 'widgets'] as const)
    .withDefault('my')
    .parse(searchParams.tab)

  const [user, donations, widgets] = await Promise.all([
    prisma.user.findFirst(),
    prisma.donation.findMany({ include: { user: true, videoRequest: true } }),
    prisma.videoRequest.findMany({ include: { user: true, donations: true } })
  ])

  return (
    <section className="mx-auto max-w-3xl p-4">
      <nav className="mb-4 flex gap-4 border-b">
        <TabLink label="Моя сторінка" value="my" current={tab} />
        <TabLink label="Донати" value="donations" current={tab} />
        <TabLink label="Віджети" value="widgets" current={tab} />
      </nav>

      {tab === 'my' && <ProfileForm user={user} />}
      {tab === 'donations' && <DonationsTable donations={donations} />}
      {tab === 'widgets' && <WidgetsTable widgets={widgets} />}
    </section>
  )
}

interface TabLinkProps {
  label: string
  value: string
  current: string
}

function TabLink({ label, value, current }: TabLinkProps) {
  const isActive = current === value
  return (
    <Link
      href={`/dashboard?tab=${value}`}
      className={`pb-2 text-sm ${isActive ? 'border-b-2 font-medium' : 'text-muted-foreground'}`}
    >
      {label}
    </Link>
  )
}

interface ProfileFormProps {
  user: User | null
}

function ProfileForm({ user }: ProfileFormProps) {
  if (!user) return <p>Користувача не знайдено</p>
  return (
    <form className="grid gap-4">
      <label className="grid gap-1">
        <span className="text-sm font-medium">Email</span>
        <input
          className="rounded-md border px-2 py-1"
          defaultValue={user.email}
          disabled
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-medium">Ім’я</span>
        <input
          className="rounded-md border px-2 py-1"
          defaultValue={user.name ?? ''}
          disabled
        />
      </label>
      <Button type="button" variant="secondary">Оновити</Button>
    </form>
  )
}

interface DonationsTableProps {
  donations: (Donation & { user: User | null })[]
}

function DonationsTable({ donations }: DonationsTableProps) {
  if (!donations.length) return <p>Немає донатів</p>
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="py-2">Сума</th>
          <th className="py-2">Користувач</th>
        </tr>
      </thead>
      <tbody>
        {donations.map((donation) => (
          <tr key={donation.id} className="border-b">
            <td className="py-2">{donation.amount}</td>
            <td className="py-2">{donation.user?.email ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface WidgetsTableProps {
  widgets: (VideoRequest & { user: User | null })[]
}

function WidgetsTable({ widgets }: WidgetsTableProps) {
  if (!widgets.length) return <p>Немає віджетів</p>
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="py-2">URL</th>
          <th className="py-2">Статус</th>
        </tr>
      </thead>
      <tbody>
        {widgets.map((widget) => (
          <tr key={widget.id} className="border-b">
            <td className="py-2">{widget.url}</td>
            <td className="py-2">{widget.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

