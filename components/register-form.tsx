'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { register, type RegisterState } from '@/app/register/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const FIELDS = [
  { name: 'login', label: 'Логин', type: 'text', placeholder: 'Ivanov2026', hint: 'Латиница и цифры, не менее 6 символов' },
  { name: 'password', label: 'Пароль', type: 'password', placeholder: '', hint: 'Не менее 8 символов' },
  { name: 'fullname', label: 'ФИО', type: 'text', placeholder: 'Иванов Иван Иванович', hint: 'Только кириллица и пробелы' },
  { name: 'phone', label: 'Телефон', type: 'tel', placeholder: '8(999)123-45-67', hint: '' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'ivan@example.com', hint: '' },
] as const

const initialState: RegisterState = {}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState)
  const errors = state.fieldErrors ?? {}

  return (
    <Card>
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Заполните данные, чтобы создать аккаунт</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            {FIELDS.map((field) => (
              <Field key={field.name} data-invalid={!!errors[field.name]}>
                <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  aria-invalid={!!errors[field.name]}
                  required
                />
                {errors[field.name] ? (
                  <FieldError errors={[{ message: errors[field.name] }]} />
                ) : (
                  field.hint && <FieldDescription>{field.hint}</FieldDescription>
                )}
              </Field>
            ))}
            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? 'Создаём...' : 'Зарегистрироваться'}
              </Button>
              <FieldDescription className="text-center">
                Уже есть аккаунт? <Link href="/login">Войти</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
