import clsx from 'clsx'
import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { FieldValues, Path, RegisterOptions, useFormContext } from 'react-hook-form'
import styles from './Input.module.css'

type InputProps<T extends FieldValues, Select extends boolean = false> = (Select extends true
  ? SelectHTMLAttributes<HTMLSelectElement>
  : InputHTMLAttributes<HTMLInputElement>) & {
  name: Path<T>
  className?: string
  inputClassName?: string
  rules?: RegisterOptions<T, Path<T>>
  select?: boolean
  children?: ReactNode
}

export default function Input<T extends FieldValues, Select extends boolean = false>({
  name,
  className,
  inputClassName,
  rules,
  select,
  children,
  ...props
}: InputProps<T, Select>): JSX.Element {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>()

  return (
    <div className={clsx('flex flex-col', className)}>
      <div className={clsx(styles.inputWrapper, errors[name] ? styles.error : '')}>
        {select ? (
          <select
            {...(props as SelectHTMLAttributes<HTMLSelectElement>)}
            className={clsx(styles.select, inputClassName)}
            {...register(name, rules)}
          >
            {children}
          </select>
        ) : (
          <input
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
            className={clsx(styles.input, inputClassName)}
            {...register(name, rules)}
          />
        )}
      </div>
      {errors[name] && (
        <span className={clsx(styles.errorText)}>{errors[name]!.message?.toString()}</span>
      )}
    </div>
  )
}
