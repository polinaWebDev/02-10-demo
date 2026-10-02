'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login, type LoginState } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const initialState: LoginState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Логин и пароль</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login">Логин</FieldLabel>
              <Input id="login" name="login" type="text" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Пароль</FieldLabel>
              <Input id="password" name="password" type="password" required />
            </Field>
            {state.formError && <FieldError>{state.formError}</FieldError>}
            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? 'Входим...' : 'Войти'}
              </Button>
              <FieldDescription className="text-center">
                Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
