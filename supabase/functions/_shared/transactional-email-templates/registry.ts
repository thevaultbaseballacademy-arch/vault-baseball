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
import { template as campConfirmation } from './camp-confirmation.tsx'
import { template as campCancellation } from './camp-cancellation.tsx'
import { template as campStaffNotification } from './camp-staff-notification.tsx'
import { template as bankTransferInstructions } from './bank-transfer-instructions.tsx'
import { template as purchaseStaffNotification } from './purchase-staff-notification.tsx'
import { template as coachWelcome } from './coach-welcome.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'tryout-confirmation': tryoutConfirmation,
  'tryout-reminder': tryoutReminder,
  'tryout-cancellation': tryoutCancellation,
  'tryout-staff-notification': tryoutStaffNotification,
  'camp-confirmation': campConfirmation,
  'camp-cancellation': campCancellation,
  'camp-staff-notification': campStaffNotification,
  'bank-transfer-instructions': bankTransferInstructions,
  'purchase-staff-notification': purchaseStaffNotification,
}
