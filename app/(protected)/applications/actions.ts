'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function addReview(applicationId: string, formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session) {
    return
  }

  const review = String(formData.get('review') ?? '').trim()
  if (!review || review.length > 2000) {
    return
  }

  const application = await prisma.application.findUnique({ where: { id: applicationId } })
  if (!application || application.userId !== session.userId || application.status !== 'completed') {
    return
  }

  await prisma.application.update({ where: { id: applicationId }, data: { review } })
  revalidatePath('/applications')
}
