import { ApplicationForm } from '@/components/ApplicationForm'

export default function NewApplicationPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <ApplicationForm />
      </div>
    </div>
  )
}
