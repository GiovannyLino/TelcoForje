import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldError } from '@/components/shared/field-error'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & {
  label: string
  icon?: ReactNode
  error?: string
  /** Ativa o botão de mostrar/ocultar senha (alterna o type). */
  passwordToggle?: boolean
}

export const FloatingField = forwardRef<HTMLInputElement, Props>(function FloatingField(
  { label, icon, error, passwordToggle, type = 'text', id, className, disabled, ...props },
  ref,
) {
  const [reveal, setReveal] = useState(false)
  const inputType = passwordToggle ? (reveal ? 'text' : 'password') : type
  const invalid = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="group relative">
        {icon ? (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-signal [&_svg]:size-4"
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          type={inputType}
          disabled={disabled}
          aria-invalid={invalid}
          placeholder=" "
          className={cn(
            'peer h-12 w-full rounded-md border bg-surface/60 px-3 pb-1.5 pt-5 text-sm text-ink outline-none transition-[border-color,box-shadow] backdrop-blur-sm',
            'placeholder:text-transparent focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon ? 'pl-10' : 'pl-3',
            passwordToggle ? 'pr-10' : 'pr-3',
            invalid
              ? 'border-halt focus-visible:ring-halt'
              : 'border-line focus-visible:border-signal focus-visible:ring-signal',
            className,
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-[14px] text-muted transition-all duration-150',
            icon ? 'left-10' : 'left-3',
            // flutua quando focado ou preenchido
            'peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-medium',
            'peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px]',
            invalid ? 'peer-focus:text-halt' : 'peer-focus:text-signal',
          )}
        >
          {label}
        </label>
        {passwordToggle ? (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
            aria-label={reveal ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      <FieldError message={error} />
    </div>
  )
})
