import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const FACILITY = '31 Park Rd, Tinton Falls, NJ 07724'

interface Props {
  playerName?: string
  parentName?: string
  eventName?: string
  eventDate?: string
  eventTime?: string
  cancelUrl?: string
}

const TryoutReminder = ({
  playerName = 'your player',
  parentName,
  eventName = 'tomorrow\'s tryout',
  eventDate = 'tomorrow',
  eventTime = '6:00 PM – 8:30 PM',
  cancelUrl = '#',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reminder: {eventName} is tomorrow</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>See you tomorrow ⚾</Heading>
        <Text style={text}>
          {parentName ? `Hi ${parentName},` : 'Hi,'} just a reminder that {playerName} is signed up for <strong>{eventName}</strong>.
        </Text>
        <Section style={card}>
          <Text style={cardValue}><strong>When:</strong> {eventDate}, {eventTime}</Text>
          <Text style={cardValue}><strong>Where:</strong> {FACILITY}</Text>
          <Text style={cardValue}><strong>Bring:</strong> glove, cleats/turfs, water</Text>
        </Section>
        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button style={button} href={cancelUrl}>Need to cancel?</Button>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TryoutReminder,
  subject: (d: Record<string, any>) => `Reminder: ${d.eventName ?? 'Tryout'} tomorrow`,
  displayName: 'Tryout 24h reminder',
  previewData: {
    playerName: 'Jake',
    parentName: 'Sam',
    eventName: 'Spring 2026 Tryout — 9-12 Group',
    eventDate: 'Sunday, March 8',
    eventTime: '6:00 PM – 8:30 PM',
    cancelUrl: 'https://vault-baseball.lovable.app/tryouts/cancel/example',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#333', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#f8f8f6', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px 20px', margin: '20px 0' }
const cardValue = { fontSize: '14px', color: '#0a0a0a', margin: '0 0 8px' }
const button = { backgroundColor: '#0a0a0a', color: '#fff', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px' }
