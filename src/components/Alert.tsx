import {
  BsCheckCircleFill,
  BsExclamationTriangleFill,
  BsInfoCircleFill,
  BsXCircleFill,
  Notice,
  type NoticeProps,
} from '@nearform/quantum'
import React from 'react'

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error'

// Quantum's Notice only ships info and warning variants, so success and error
// reuse the outlined info layout with Quantum's feedback colour tokens.
const severityStyles: Record<
  AlertSeverity,
  { variant: NoticeProps['variant']; className?: string; icon: JSX.Element }
> = {
  success: {
    variant: 'info',
    className: 'border-feedback-success dark:border-feedback-success-dark',
    icon: (
      <BsCheckCircleFill className='text-feedback-success dark:text-feedback-success-dark' />
    ),
  },
  info: {
    variant: 'info',
    icon: <BsInfoCircleFill />,
  },
  warning: {
    variant: 'warning',
    icon: <BsExclamationTriangleFill />,
  },
  error: {
    variant: 'info',
    className: 'border-feedback-error dark:border-feedback-error-dark',
    icon: (
      <BsXCircleFill className='text-feedback-error dark:text-feedback-error-dark' />
    ),
  },
}

interface AlertProps extends Omit<NoticeProps, 'variant' | 'icon'> {
  severity: AlertSeverity
}

const Alert = ({ severity, className, ...props }: AlertProps): JSX.Element => {
  const {
    variant,
    className: severityClassName,
    icon,
  } = severityStyles[severity]

  return (
    <Notice
      variant={variant}
      icon={icon}
      data-severity={severity}
      className={['justify-start rounded-lg px-4', severityClassName, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

export default Alert
