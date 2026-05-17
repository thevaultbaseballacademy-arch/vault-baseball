/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = '22M Baseball'
const SUPPORT_EMAIL = 'staff@methods22.com'
const SITE_URL = 'https://vault-baseball.lovable.app'

interface Props {
  reference?: string
  amountCents?: number
  campName?: string
  athleteName?: string
  payByCardUrl?: string
}

const fmt = (cents?: number) =>
  typeof cents === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
    : ''

const BankTransferInstructions = ({
  reference = '',
  amountCents,
  campName = 'Summer Development Camp',
  athleteName = 'your athlete',
  payByCardUrl,
}: Props) => {
  const amount = fmt(amountCents)
  const instructionsUrl = `${SITE_URL}/`
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Spot reserved for {campName} — complete payment to confirm</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your spot is reserved 🎟️</Heading>
          <Text style={text}>
            Thanks for registering {athleteName} for <strong>{campName}</strong>.
            Your spot is held as <strong>pending payment</strong>. Complete payment below to fully confirm.
          </Text>

          {payByCardUrl && (
            <>
              <Section style={{ textAlign: 'center', margin: '24px 0 8px' }}>
                <Button style={button} href={payByCardUrl}>
                  Pay {amount} by Card (instant)
                </Button>
              </Section>
              <Text style={smallCenter}>Fastest — your spot is confirmed immediately.</Text>
              <Hr style={hr} />
              <Text style={cardLabel}>OR PAY BY BANK TRANSFER</Text>
            </>
          )}

          <Section style={card}>
            <Text style={cardLabel}>AMOUNT</Text>
            <Text style={cardValue}>{amount}</Text>
            <Hr style={hr} />
            <Text style={cardLabel}>REFERENCE (include with transfer)</Text>
            <Text style={cardMono}>{reference}</Text>
            <Hr style={hr} />
            <Text style={cardLabel}>BANK DETAILS</Text>
            <Text style={cardValue}>Open your full bank transfer instructions:</Text>
            <Section style={{ textAlign: 'center', margin: '12px 0 0' }}>
              <Button style={buttonGhost} href={instructionsUrl}>View bank details</Button>
            </Section>
          </Section>

          <Text style={text}>
            <strong>What happens next:</strong> once funds arrive (1–3 business days),
            we'll send your full confirmation with camp details. Always include your
            reference code <strong>{reference}</strong> so we can match the payment.
          </Text>

          <Text style={footer}>Questions? Reply to this email or contact {SUPPORT_EMAIL}</Text>
          <Text style={footer}>— The {SITE_NAME} Staff</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BankTransferInstructions,
  subject: (d: Record<string, any>) =>
    `Spot reserved — complete payment for ${d.campName ?? 'Summer Camp'}`,
  displayName: 'Bank transfer instructions',
  previewData: {
    reference: 'CAMP-AB12CD',
    amountCents: 25000,
    campName: '22M Elite Summer Development Camp',
    athleteName: 'Jake',
    payByCardUrl: 'https://buy.stripe.com/28EdR89pIcaZcM66il6Na02',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#333', lineHeight: '1.6', margin: '0 0 16px' }
const smallCenter = { fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: '0 0 8px' }
const card = { backgroundColor: '#f8f8f6', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '20px', margin: '16px 0' }
const cardLabel = { fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', color: '#888', margin: '0 0 4px' }
const cardValue = { fontSize: '15px', color: '#0a0a0a', margin: '0 0 6px' }
const cardMono = { fontSize: '18px', color: '#0a0a0a', margin: '0 0 6px', fontFamily: 'Menlo, monospace', fontWeight: 'bold' as const }
const hr = { borderTop: '1px solid #e5e5e5', margin: '12px 0' }
const button = { backgroundColor: '#c9a227', color: '#000', padding: '14px 28px', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px' }
const buttonGhost = { backgroundColor: 'transparent', color: '#666', padding: '8px 16px', border: '1px solid #ddd', borderRadius: '6px', textDecoration: 'none', fontSize: '13px' }
const footer = { fontSize: '13px', color: '#888', margin: '8px 0 0', textAlign: 'center' as const }
