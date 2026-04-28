import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = '22M Baseball'
const FACILITY = '22M Training Facility — 31 Park Rd, Tinton Falls, NJ 07724'

interface Props {
  playerName?: string
  parentName?: string
  eventName?: string
  eventDate?: string
  eventTime?: string
  cancelUrl?: string
  calendarUrl?: string
  confirmationNumber?: string
}

const TryoutConfirmation = ({
  playerName = 'your player',
  parentName,
  eventName = 'Spring 2026 Tryout',
  eventDate = 'TBD',
  eventTime = '6:00 PM – 8:30 PM',
  cancelUrl = '#',
  calendarUrl,
  confirmationNumber,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{eventName} confirmed for {playerName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're registered! 🎉</Heading>
        <Text style={text}>
          {parentName ? `Hi ${parentName},` : 'Hi,'}
        </Text>
        <Text style={text}>
          {playerName} is confirmed for <strong>{eventName}</strong>. Below are the details — a calendar invite is attached.
        </Text>
        <Section style={card}>
          <Text style={cardLabel}>WHEN</Text>
          <Text style={cardValue}>{eventDate}</Text>
          <Text style={cardValue}>{eventTime}</Text>
          <Hr style={hr} />
          <Text style={cardLabel}>WHERE</Text>
          <Text style={cardValue}>{FACILITY}</Text>
        </Section>
        <Text style={text}>
          <strong>What to bring:</strong> glove, cleats/turfs, water, and your A-game.
        </Text>
        {calendarUrl && (
          <Section style={{ textAlign: 'center', margin: '24px 0 8px' }}>
            <Button style={button} href={calendarUrl}>📅 Add to calendar</Button>
          </Section>
        )}
        <Section style={{ textAlign: 'center', margin: '16px 0 24px' }}>
          <Button style={buttonGhost} href={cancelUrl}>Can't make it? Cancel here</Button>
        </Section>
        {confirmationNumber && (
          <Text style={confNum}>Confirmation #: {confirmationNumber}</Text>
        )}
        <Text style={footer}>Questions? Reply to this email or contact staff@methods22.com</Text>
        <Text style={footer}>— The {SITE_NAME} Staff</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TryoutConfirmation,
  subject: (d: Record<string, any>) => `✅ Registered: ${d.eventName ?? 'Spring 2026 Tryout'}`,
  displayName: 'Tryout confirmation',
  previewData: {
    playerName: 'Jake',
    parentName: 'Sam',
    eventName: 'Spring 2026 Tryout — 9-12 Group',
    eventDate: 'Sunday, March 8, 2026',
    eventTime: '6:00 PM – 8:30 PM',
    cancelUrl: 'https://vault-baseball.lovable.app/tryouts/cancel/example',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#333', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#f8f8f6', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '20px', margin: '20px 0' }
const cardLabel = { fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', color: '#888', margin: '0 0 4px' }
const cardValue = { fontSize: '15px', color: '#0a0a0a', margin: '0 0 12px' }
const hr = { borderTop: '1px solid #e5e5e5', margin: '12px 0' }
const button = { backgroundColor: '#c9a227', color: '#000', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }
const footer = { fontSize: '13px', color: '#888', margin: '24px 0 0' }
