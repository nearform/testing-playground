import { Notice, type NoticeProps } from '@nearform/quantum'
import React from 'react'

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error'

interface AlertProps extends Omit<NoticeProps, 'variant'> {
  severity: AlertSeverity
}

const Alert = ({ severity, className, ...props }: AlertProps): JSX.Element => (
  <Notice
    variant={severity}
    data-severity={severity}
    className={['justify-start rounded-lg px-4', className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
)

export default Alert
