'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { createApplication, type NewApplicationState } from '@/app/(protected)/applications/new/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { LabeledSelect } from '@/components/LabeledSelect'
import { COURSE_LABELS } from '@/lib/labels'

const initialState: NewApplicationState = {}

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState(createApplication, initialState)
  const errors = state.fieldErrors ?? {}

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новая заявка</CardTitle>
        <CardDescription>Выберите курс и опишите, что вам нужно</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!errors.course}>
              <FieldLabel htmlFor="course">Курс</FieldLabel>
              <LabeledSelect
                name="course"
                defaultValue="algorithms"
                labels={COURSE_LABELS}
                ariaLabel="Курс"
                className="w-full"
              />
              {errors.course && <FieldError errors={[{ message: errors.course }]} />}
            </Field>
            <Field data-invalid={!!errors.text}>
              <FieldLabel htmlFor="text">Текст заявки</FieldLabel>
              <Textarea
                id="text"
                name="text"
                rows={5}
                maxLength={2000}
                aria-invalid={!!errors.text}
                required
              />
              {errors.text && <FieldError errors={[{ message: errors.text }]} />}
            </Field>
            <Field orientation="horizontal">
              <Button type="submit" disabled={pending}>
                {pending ? 'Отправляем...' : 'Отправить'}
              </Button>
              <Button render={<Link href="/applications" />} nativeButton={false} variant="outline">
                Отмена
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
