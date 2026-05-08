/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  playerName?: string
  playerAge?: string | number
  playerDob?: string
  campName?: string
  cohortLabel?: string
  venueName?: string
  sessionsList?: string[]
  registrationType?: string
  amountPaid?: string
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyRelationship?: string
  medicalNotes?: string
  confirmationNumber?: string
}

const Row = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Text style={row}>
    <span style={labelStyle}>{label}:</span>{' '}
    <span style={valueStyle}>{value || '—'}</span>
  </Text>
)

const CampStaffNotification = ({
  playerName, playerAge, playerDob, campName, cohortLabel, venueName,
  sessionsList = [], registrationType, amountPaid,
  parentName, parentEmail, parentPhone,
  emergencyContactName, emergencyContactPhone, emergencyRelationship,
  medicalNotes, confirmationNumber,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New camp registration: {playerName} for {campName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Camp Registration</Heading>
        <Text style={statusBadge}>PAID — {amountPaid}</Text>

        <Section style={section}>
          <Heading style={h2}>Camp</Heading>
          <Row label="Camp" value={campName} />
          <Row label="Cohort" value={cohortLabel} />
          <Row label="Venue" value={venueName} />
          <Row label="Type" value={registrationType === 'full_pass' ? 'Full 4-Week Pass' : 'Weekly'} />
          {sessionsList.map((s, i) => (
            <Row key={i} label={`Week ${i + 1}`} value={s} />
          ))}
        </Section>

        <Hr style={hr} />
        <Section style={section}>
          <Heading style={h2}>Player</Heading>
          <Row label="Name" value={playerName} />
          <Row label="Age" value={playerAge} />
          <Row label="DOB" value={playerDob} />
        </Section>

        <Hr style={hr} />
        <Section style={section}>
          <Heading style={h2}>Parent / Guardian</Heading>
          <Row label="Name" value={parentName} />
          <Row label="Email" value={parentEmail} />
          <Row label="Phone" value={parentPhone} />
        </Section>

        <Hr style={hr} />
        <Section style={section}>
          <Heading style={h2}>Emergency Contact</Heading>
          <Row label="Name" value={emergencyContactName} />
          <Row label="Phone" value={emergencyContactPhone} />
          <Row label="Relationship" value={emergencyRelationship} />
        </Section>

        {medicalNotes && (
          <>
            <Hr style={hr} />
            <Section style={section}>
              <Heading style={h2}>Medical Notes</Heading>
              <Text style={noteBox}>{medicalNotes}</Text>
            </Section>
          </>
        )}

        <Hr style={hr} />
        <Text style={footer}>Confirmation #: {confirmationNumber} · Vault OS — 22M Baseball Camp Registration</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CampStaffNotification,
  subject: (d: Record<string, any>) =>
    `New camp registration: ${d.playerName ?? 'Player'} — ${d.campName ?? 'Camp'}`,
  displayName: 'Staff: New camp registration',
  to: 'staff@methods22.com',
  previewData: {
    playerName: 'Jane Smith',
    playerAge: 9,
    playerDob: '2016-08-12',
    campName: '22M Elite Summer Development Camp',
    cohortLabel: 'Ages 7–10',
    venueName: 'Ross Field, Keyport NJ',
    sessionsList: ['Jun 29 – Jul 2', 'Jul 6 – Jul 9'],
    registrationType: 'weekly',
    amountPaid: '$500.00',
    parentName: 'John Smith',
    parentEmail: 'john@example.com',
    parentPhone: '732-555-0100',
    emergencyContactName: 'Mary Smith',
    emergencyContactPhone: '732-555-0101',
    emergencyRelationship: 'Mother',
    medicalNotes: 'Mild asthma — inhaler on hand.',
    confirmationNumber: 'CAMP1234',
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
const statusBadge = { display: 'inline-block', padding: '4px 10px', backgroundColor: '#bbf7d0', color: '#14532d', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', margin: '0 0 16px' }
const noteBox = { fontSize: '14px', color: '#1f1f1f', backgroundColor: '#fef3c7', padding: '12px', borderRadius: '4px', margin: '0' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const footer = { fontSize: '11px', color: '#9ca3af', margin: '20px 0 0', textAlign: 'center' as const }
