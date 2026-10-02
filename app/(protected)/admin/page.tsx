import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LabeledSelect } from '@/components/LabeledSelect'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { COURSE_LABELS, PAYMENT_LABELS, STATUS_LABELS } from '@/lib/labels'
import { updateStatus } from './actions'
import { logout } from '@/app/logout/actions'
import type { Course, Status } from '@/app/generated/prisma/client'

const PAGE_SIZE = 10

const STATUS_FILTER_LABELS: Record<string, string> = { all: 'Все статусы', ...STATUS_LABELS }
const COURSE_FILTER_LABELS: Record<string, string> = { all: 'Все курсы', ...COURSE_LABELS }

interface AdminPageProps {
  searchParams: Promise<{ status?: string; course?: string; page?: string; updated?: string }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  const params = await searchParams
  const status =
    params.status && params.status !== 'all' && params.status in STATUS_LABELS
      ? (params.status as Status)
      : undefined
  const course =
    params.course && params.course !== 'all' && params.course in COURSE_LABELS
      ? (params.course as Course)
      : undefined
  const pageNum = Number(params.page)
  const page = Number.isFinite(pageNum) && pageNum >= 1 ? Math.floor(pageNum) : 1

  const where = {
    ...(status ? { status } : {}),
    ...(course ? { course } : {}),
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.application.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildUrl(targetPage: number): string {
    const query = new URLSearchParams()
    if (status) query.set('status', status)
    if (course) query.set('course', course)
    query.set('page', String(targetPage))
    return `/admin?${query.toString()}`
  }

  const currentUrl = buildUrl(page)

  return (
    <div className="flex min-h-svh w-full flex-col items-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Панель администратора</h1>
        <form action={logout}>
          <Button type="submit" variant="outline">Выйти</Button>
        </form>
      </div>

      {params.updated === 'true' && (
        <div className="w-full max-w-5xl rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
          Статус заявки обновлён
        </div>
      )}

      <form method="GET" className="flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:flex-wrap">
        <LabeledSelect
          name="status"
          defaultValue={status ?? 'all'}
          labels={STATUS_FILTER_LABELS}
          ariaLabel="Фильтр по статусу"
          className="w-full sm:w-48"
        />
        <LabeledSelect
          name="course"
          defaultValue={course ?? 'all'}
          labels={COURSE_FILTER_LABELS}
          ariaLabel="Фильтр по курсу"
          className="w-full sm:w-64"
        />
        <Button type="submit" variant="secondary">
          Применить
        </Button>
      </form>

      <div className="w-full max-w-5xl overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Курс</TableHead>
              <TableHead>Заявка</TableHead>
              <TableHead>Оплата</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Заявок нет
                </TableCell>
              </TableRow>
            )}
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  <div className="font-medium">{application.user.fullname}</div>
                  <div className="text-xs text-muted-foreground">{application.user.phone}</div>
                </TableCell>
                <TableCell>{COURSE_LABELS[application.course]}</TableCell>
                <TableCell className="max-w-56 truncate" title={application.text}>
                  {application.text}
                </TableCell>
                <TableCell>{PAYMENT_LABELS[application.payment]}</TableCell>
                <TableCell>
                  <form action={updateStatus} className="flex items-center gap-2">
                    <input type="hidden" name="applicationId" value={application.id} />
                    <input type="hidden" name="redirectTo" value={currentUrl} />
                    <LabeledSelect
                      name="status"
                      defaultValue={application.status}
                      labels={STATUS_LABELS}
                      ariaLabel="Статус заявки"
                      size="sm"
                      className="w-44"
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      Сохранить
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-3">
        {page <= 1 ? (
          <Button variant="secondary" disabled>
            Назад
          </Button>
        ) : (
          <Button variant="secondary" render={<Link href={buildUrl(page - 1)} />} nativeButton={false}>
            Назад
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          Страница {page} из {totalPages}
        </span>
        {page >= totalPages ? (
          <Button variant="secondary" disabled>
            Вперёд
          </Button>
        ) : (
          <Button variant="secondary" render={<Link href={buildUrl(page + 1)} />} nativeButton={false}>
            Вперёд
          </Button>
        )}
      </div>
    </div>
  )
}
