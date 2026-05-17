/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  category?: string
  productLabel?: string
  productKey?: string
  amountPaid?: string
  customerEmail?: string
  customerName?: string
  stripeSessionId?: string
  stripePaymentIntentId?: string
  stripeSubscriptionId?: string
  notes?: string
}

const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <Text style={row}>
    <span style={labelStyle}>{label}:</span>{' '}
    <span style={valueStyle}>{value || '—'}</span>
  </Text>
)

const PurchaseStaffNotification = ({
  category, productLabel, productKey, amountPaid,
  customerEmail, customerName,
  stripeSessionId, stripePaymentIntentId, stripeSubscriptionId, notes,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New {category || 'purchase'}: {productLabel || productKey || ''} — {amountPaid || ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Purchase</Heading>
        <Text style={statusBadge}>PAID{amountPaid ? ` — ${amountPaid}` : ''}</Text>

        <Section style={section}>
          <Row label="Category" value={category} />
          <Row label="Product" value={productLabel || productKey} />
          <Row label="Product key" value={productKey} />
          <Row label="Amount" value={amountPaid} />
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Heading as="h2" style={h2}>Customer</Heading>
          <Row label="Name" value={customerName} />
          <Row label="Email" value={customerEmail} />
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Heading as="h2" style={h2}>Stripe</Heading>
          <Row label="Session" value={stripeSessionId} />
          <Row label="Payment intent" value={stripePaymentIntentId} />
          <Row label="Subscription" value={stripeSubscriptionId} />
        </Section>

        {notes ? (
          <>
            <Hr style={hr} />
            <Section style={section}>
              <Row label="Notes" value={notes} />
            </Section>
          </>
        ) : null}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PurchaseStaffNotification,
  subject: (d: Record<string, any>) =>
    `New ${d?.category || 'purchase'}: ${d?.productLabel || d?.productKey || ''}${d?.amountPaid ? ` — ${d.amountPaid}` : ''}`.trim(),
  displayName: 'Purchase staff notification',
  previewData: {
    category: 'certification',
    productLabel: 'Vault Certified Coach',
    productKey: 'certified_coach',
    amountPaid: '$499.00',
    customerEmail: 'parent@example.com',
    customerName: 'Jane Doe',
    stripeSessionId: 'cs_test_123',
    stripePaymentIntentId: 'pi_test_123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 12px' }
const h2 = { fontSize: '16px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 8px' }
const section = { margin: '12px 0' }
const row = { fontSize: '14px', color: '#222', margin: '4px 0', lineHeight: '1.5' }
const labelStyle = { color: '#666', fontWeight: 600 as const }
const valueStyle = { color: '#111' }
const statusBadge = {
  display: 'inline-block', padding: '4px 10px', borderRadius: '4px',
  backgroundColor: '#e8f6ee', color: '#0a7a3f', fontWeight: 700 as const,
  fontSize: '12px', margin: '0 0 16px',
}
const hr = { borderColor: '#eee', margin: '16px 0' }
