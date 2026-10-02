'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { createSession } from '@/lib/session'
import { LOGIN_RE, FULL_NAME_RE, PHONE_RE } from '@/lib/validation'

export interface RegisterState {
  fieldErrors?: Record<string, string>
}

const registerSchema = z.object({
  login: z.string().regex(LOGIN_RE, 'Логин: только латиница и цифры, не менее 6 символов'),
  password: z.string().min(8, 'Пароль должен содержать не менее 8 символов'),
  fullname: z.string().trim().regex(FULL_NAME_RE, 'ФИО: только кириллица и пробелы'),
  phone: z.string().regex(PHONE_RE, 'Телефон в формате ...'),
  email: z.email('Некорректный адрес электронной почты'),
})

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const result = registerSchema.safeParse({
    login: String(formData.get('login') ?? ''),
    password: String(formData.get('password') ?? ''),
    fullname: String(formData.get('fullname') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    email: String(formData.get('email') ?? ''),
  })

  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message
    }
    return { fieldErrors }
  }

  const { login, password, fullname, phone, email } = result.data

  const existing = await prisma.user.findFirst({
    where: { OR: [{ login }, { email }, { phone }] },
    select: { login: true, email: true, phone: true },
  })
  if (existing) {
    const fieldErrors: Record<string, string> = {}
    if (existing.login === login) fieldErrors.login = 'Логин занят'
    if (existing.email === email) fieldErrors.email = 'Email уже зарегистрирован'
    if (existing.phone === phone) fieldErrors.phone = 'Телефон уже зарегистрирован'
    return { fieldErrors }
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { login, passwordHash, fullname, phone, email },
  })

  await createSession({ userId: user.id, role: user.role })

  redirect('/applications')
}
