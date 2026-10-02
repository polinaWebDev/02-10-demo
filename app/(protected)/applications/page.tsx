import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { COURSE_LABELS, PAYMENT_LABELS, STATUS_LABELS } from '@/lib/labels'
import { logout } from '@/app/logout/actions'
import { addReview } from './actions'

export default async function ApplicationsPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const applications = await prisma.application.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="flex min-h-svh w-full flex-col items-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Мои заявки</h1>
        <div className="flex items-center gap-2">
          {session.role === 'ADMIN' && (
            <Button render={<Link href="/admin" />} nativeButton={false} variant="outline">
              Админка
            </Button>
          )}
          <Button render={<Link href="/applications/new" />} nativeButton={false}>
            Новая заявка
          </Button>
          <form action={logout}>
            <Button type="submit" variant="outline">Выйти</Button>
          </form>
        </div>
      </div>

      {applications.length === 0 && (
        <p className="text-muted-foreground">У вас пока нет заявок</p>
      )}

      <div className="flex w-full max-w-3xl flex-col gap-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <CardTitle>{COURSE_LABELS[application.course]}</CardTitle>
              <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                <span>Статус: {STATUS_LABELS[application.status]}</span>
                <span>Оплата: {PAYMENT_LABELS[application.payment]}</span>
                <span>{application.createdAt.toLocaleDateString('ru-RU')}</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="whitespace-pre-wrap">{application.text}</p>

              {application.review ? (
                <div className="rounded-lg bg-muted px-4 py-3 text-sm">
                  <div className="mb-1 font-medium">Ваш отзыв</div>
                  <p className="whitespace-pre-wrap">{application.review}</p>
                </div>
              ) : application.status === 'completed' ? (
                <form action={addReview.bind(null, application.id)} className="flex flex-col gap-2">
                  <Textarea name="review" rows={3} maxLength={2000} placeholder="Оставьте отзыв о курсе" required />
                  <Button type="submit" variant="secondary" className="self-start">
                    Отправить отзыв
                  </Button>
                </form>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
