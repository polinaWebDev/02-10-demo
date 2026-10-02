import { LoginForm } from '@/components/login-form'
import { ImageSlider } from '@/components/ImageSlider'

export default function Page() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
      <div className="relative hidden lg:block">
        <ImageSlider />
      </div>
    </div>
  )
}
