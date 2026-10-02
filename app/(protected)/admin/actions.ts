'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { VALID_STATUSES } from '@/lib/labels'
import type { Status } from '@/app/generated/prisma/client'

export async function updateStatus(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  const applicationId = String(formData.get('applicationId') ?? '')
  const statusRaw = String(formData.get('status') ?? '')
  const redirectToRaw = String(formData.get('redirectTo') ?? '/admin')
  // только внутренние пути админки, иначе open redirect
  const safeRedirectTo =
    redirectToRaw.startsWith('/admin') && !redirectToRaw.startsWith('//') ? redirectToRaw : '/admin'

  if (!VALID_STATUSES.includes(statusRaw as Status)) {
    redirect(safeRedirectTo)
  }

  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: statusRaw as Status },
    })
  } catch {
    redirect(safeRedirectTo)
  }

  const separator = safeRedirectTo.includes('?') ? '&' : '?'
  redirect(`${safeRedirectTo}${separator}updated=true`)
}
