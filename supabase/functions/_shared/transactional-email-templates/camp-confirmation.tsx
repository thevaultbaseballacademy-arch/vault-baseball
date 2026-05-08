/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = '22M Baseball'

interface Props {
  playerName?: string
  parentName?: string
  campName?: string
  cohortLabel?: string
  venueName?: string
  venueAddress?: string
  dailyTime?: string
  sessionsList?: string[]
  registrationType?: 'weekly' | 'full_pass' | string
  amountPaid?: string
  cancelUrl?: string
  calendarUrl?: string
  confirmationNumber?: string
}

const CampConfirmation = ({
  playerName = 'your player',
  parentName,
  campName = 'Summer Development Camp',
  cohortLabel = '',
  venueName = '',
  venueAddress = '',
  dailyTime = '',
  sessionsList = [],
  registrationType = 'weekly',
  amountPaid = '',
  cancelUrl = '#',
  calendarUrl,
  confirmationNumber,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{campName} confirmed for {playerName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're registered! 🎉</Heading>
        <Text style={text}>{parentName ? `Hi ${parentName},` : 'Hi,'}</Text>
        <Text style={text}>
          {playerName} is confirmed for <strong>{campName}</strong>
          {cohortLabel ? ` (${cohortLabel})` : ''}.
        </Text>

        <Section style={card}>
          <Text style={cardLabel}>WEEK{sessionsList.length > 1 ? 'S' : ''}</Text>
          {sessionsList.map((s, i) => (
            <Text key={i} style={cardValue}>• {s}</Text>
          ))}
          <Hr style={hr} />
          <Text style={cardLabel}>DAILY</Text>
          <Text style={cardValue}>{dailyTime || 'Mon–Fri'}</Text>
          <Hr style={hr} />
          <Text style={cardLabel}>WHERE</Text>
          <Text style={cardValue}>{venueName}</Text>
          {venueAddress && <Text style={cardValue}>{venueAddress}</Text>}
          {amountPaid && (
            <>
              <Hr style={hr} />
              <Text style={cardLabel}>PAID</Text>
              <Text style={cardValue}>
                {amountPaid} ({registrationType === 'full_pass' ? 'Full 4-Week Pass' : 'Weekly'})
              </Text>
            </>
          )}
        </Section>

        <Text style={text}>
          <strong>What to bring:</strong> glove, cleats/turfs, bat, helmet, water, sunscreen.
        </Text>

        {calendarUrl && (
          <Section style={{ textAlign: 'center', margin: '24px 0 8px' }}>
            <Button style={button} href={calendarUrl}>📅 Add to calendar</Button>
          </Section>
        )}
        <Section style={{ textAlign: 'center', margin: '16px 0 24px' }}>
          <Button style={buttonGhost} href={cancelUrl}>Need to cancel? Manage registration</Button>
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
  component: CampConfirmation,
  subject: (d: Record<string, any>) => `✅ Registered: ${d.campName ?? 'Summer Camp'}`,
  displayName: 'Camp confirmation',
  previewData: {
    playerName: 'Jake',
    parentName: 'Sam',
    campName: '22M Elite Summer Development Camp',
    cohortLabel: 'Ages 7–10',
    venueName: 'Ross Field',
    venueAddress: '756 Cliffwood Ave, Keyport NJ 07735',
    dailyTime: '9:00 AM – 12:00 PM, Mon–Fri',
    sessionsList: ['Week 1: Jun 29 – Jul 2', 'Week 2: Jul 6 – Jul 9'],
    registrationType: 'weekly',
    amountPaid: '$500.00',
    cancelUrl: 'https://vault-baseball.lovable.app/camps/cancel/example',
    confirmationNumber: 'CAMP1234',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#333', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#f8f8f6', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '20px', margin: '20px 0' }
const cardLabel = { fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', color: '#888', margin: '0 0 4px' }
const cardValue = { fontSize: '15px', color: '#0a0a0a', margin: '0 0 6px' }
const hr = { borderTop: '1px solid #e5e5e5', margin: '12px 0' }
const button = { backgroundColor: '#c9a227', color: '#000', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }
const buttonGhost = { backgroundColor: 'transparent', color: '#666', padding: '8px 16px', border: '1px solid #ddd', borderRadius: '6px', textDecoration: 'none', fontSize: '13px' }
const confNum = { fontSize: '12px', color: '#888', textAlign: 'center' as const, margin: '0 0 8px' }
const footer = { fontSize: '13px', color: '#888', margin: '8px 0 0', textAlign: 'center' as const }
