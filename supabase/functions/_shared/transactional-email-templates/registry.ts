/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as tryoutConfirmation } from './tryout-confirmation.tsx'
import { template as tryoutReminder } from './tryout-reminder.tsx'
import { template as tryoutCancellation } from './tryout-cancellation.tsx'
import { template as tryoutStaffNotification } from './tryout-staff-notification.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'tryout-confirmation': tryoutConfirmation,
  'tryout-reminder': tryoutReminder,
  'tryout-cancellation': tryoutCancellation,
  'tryout-staff-notification': tryoutStaffNotification,
}
