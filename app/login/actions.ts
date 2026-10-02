'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { comparePassword } from '@/lib/password'
import { createSession } from '@/lib/session'

export interface LoginState {
  formError?: string
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const login = String(formData.get('login') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!login || !password) {
    return { formError: 'Заполните все поля' }
  }

  const user = await prisma.user.findUnique({ where: { login } })
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return { formError: 'Неверный логин или пароль' }
  }

  await createSession({ userId: user.id, role: user.role })

  redirect(user.role === 'ADMIN' ? '/admin' : '/applications')
}
