/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface CoachOnboardedProps {
  coachName?: string
  coachEmail?: string
  accessLevel?: string
  verifiedBadge?: string
  notes?: string
  addedBy?: string
}

const Row = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Text style={row}>
    <span style={labelStyle}>{label}:</span>{' '}
    <span style={valueStyle}>{value || '—'}</span>
  </Text>
)

const CoachOnboardedEmail = ({
  coachName, coachEmail, accessLevel, verifiedBadge, notes, addedBy,
}: CoachOnboardedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New coach onboarded: {coachName ?? coachEmail}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Coach Onboarded</Heading>
        <Text style={statusBadge}>VAULT VERIFIED</Text>

        <Section style={section}>
          <Heading style={h2}>Coach</Heading>
          <Row label="Name" value={coachName} />
          <Row label="Email" value={coachEmail} />
          <Row label="Access Level" value={accessLevel ?? 'Full Coach Access'} />
          <Row label="Verified Badge" value={verifiedBadge ?? 'Yes'} />
        </Section>

        {(notes || addedBy) ? (
          <>
            <Hr style={hr} />
            <Section style={section}>
              <Heading style={h2}>Provisioning</Heading>
              {addedBy ? <Row label="Added By" value={addedBy} /> : null}
              {notes ? <Row label="Notes" value={notes} /> : null}
            </Section>
          </>
        ) : null}

        <Hr style={hr} />
        <Text style={footer}>
          Vault OS — Coach Provisioning System
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CoachOnboardedEmail,
  subject: (data: Record<string, any>) =>
    `New coach onboarded: ${data.coachName ?? data.coachEmail ?? 'Coach'}`,
  displayName: 'Staff: New coach onboarded',
  to: 'staff@methods22.com',
  previewData: {
    coachName: 'Chris Montgomery',
    coachEmail: 'chrismontgomery13@gmail.com',
    accessLevel: 'Full Coach Access',
    verifiedBadge: 'Yes',
    notes: 'Coach — full access + Vault verified badge',
    addedBy: 'Owner',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 8px' }
const h2 = { fontSize: '14px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 8px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const section = { margin: '16px 0' }
const row = { fontSize: '14px', color: '#1f1f1f', margin: '4px 0', lineHeight: '1.5' }
const labelStyle = { color: '#6b7280', fontWeight: 600 }
const valueStyle = { color: '#0a0a0a' }
const statusBadge = { display: 'inline-block', padding: '4px 10px', backgroundColor: '#f5d97a', color: '#1a1a1a', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', margin: '0 0 16px' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const footer = { fontSize: '11px', color: '#9ca3af', margin: '20px 0 0', textAlign: 'center' as const }
