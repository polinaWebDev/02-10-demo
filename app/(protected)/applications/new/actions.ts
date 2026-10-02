'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { VALID_COURSES } from '@/lib/labels'
import type { Course } from '@/app/generated/prisma/client'

export interface NewApplicationState {
  fieldErrors?: Record<string, string>
}

const applicationSchema = z.object({
  text: z.string().trim().min(1, 'Опишите заявку').max(2000, 'Не более 2000 символов'),
  course: z
    .string()
    .refine((value) => VALID_COURSES.includes(value as Course), 'Выберите один из предложенных курсов'),
})

export async function createApplication(
  _prevState: NewApplicationState,
  formData: FormData,
): Promise<NewApplicationState> {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const result = applicationSchema.safeParse({
    text: String(formData.get('text') ?? ''),
    course: String(formData.get('course') ?? ''),
  })

  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message
    }
    return { fieldErrors }
  }

  await prisma.application.create({
    data: {
      userId: session.userId,
      text: result.data.text,
      course: result.data.course as Course,
      payment: 'UNPAID',
    },
  })

  redirect('/applications')
}
