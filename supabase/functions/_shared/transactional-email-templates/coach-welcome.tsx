/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Methods22 / VAULT OS'

interface Props {
  coachName?: string
  signInUrl?: string
  profileUrl?: string
}

const CoachWelcome = ({
  coachName = 'Coach',
  signInUrl = 'https://www.methods22.com/auth',
  profileUrl = 'https://www.methods22.com/coach/profile',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're officially a VAULT Verified Coach</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to the staff, {coachName} 🏆</Heading>
        <Text style={text}>
          Your account at <strong>{SITE_NAME}</strong> has been upgraded with
          full <strong>Coach access</strong> and your{' '}
          <strong>VAULT™ Verified Coach badge</strong>. You now have access to
          every coach feature in the platform.
        </Text>

        <Section style={card}>
          <Text style={cardLabel}>WHAT'S UNLOCKED</Text>
          <Text style={cardValue}>• Coach HQ dashboard & athlete roster</Text>
          <Text style={cardValue}>• Lesson scheduling + Google Calendar sync</Text>
          <Text style={cardValue}>• Evaluations, KPI tracker, assignments</Text>
          <Text style={cardValue}>• Content creation & downloads</Text>
          <Text style={cardValue}>• VAULT™ Verified badge on your public profile</Text>
        </Section>

        <Heading style={h2}>Next step — complete your profile</Heading>
        <Text style={text}>
          To start receiving athlete assignments and appear in the coach
          marketplace, finish your profile:
        </Text>
        <Text style={text}>
          1. Sign in with this email address<br />
          2. Open <strong>Coach HQ → My Profile</strong><br />
          3. Add your headshot, bio, specialties, location, years of experience,
          and hourly rate<br />
          4. Set your weekly availability under <strong>Schedule</strong><br />
          5. Connect Stripe for payouts (Coach HQ → Profile)
        </Text>

        <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Button href={profileUrl} style={button}>Complete My Profile</Button>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Need a hand? Reply to this email or reach out to staff@methods22.com.
        </Text>
        <Text style={footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CoachWelcome,
  subject: "🏆 You're a VAULT Verified Coach — complete your profile",
  displayName: 'Coach welcome',
  previewData: {
    coachName: 'Chris',
    signInUrl: 'https://www.methods22.com/auth',
    profileUrl: 'https://www.methods22.com/coach/profile',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 16px' }
const h2 = { fontSize: '18px', fontWeight: 'bold', color: '#0a0a0a', margin: '24px 0 12px' }
const text = { fontSize: '15px', color: '#333', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#f8f8f6', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '20px', margin: '20px 0' }
const cardLabel = { fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', color: '#888', margin: '0 0 8px' }
const cardValue = { fontSize: '15px', color: '#0a0a0a', margin: '0 0 6px' }
const hr = { borderTop: '1px solid #e5e5e5', margin: '20px 0' }
const button = { backgroundColor: '#c9a227', color: '#000', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }
const footer = { fontSize: '13px', color: '#888', margin: '8px 0 0', textAlign: 'center' as const }
