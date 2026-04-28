/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface StaffNotificationProps {
  playerName?: string
  playerAge?: string | number
  playerDob?: string
  throwingHand?: string
  position?: string
  currentTeam?: string
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyRelationship?: string
  medicalNotes?: string
  eventName?: string
  eventDate?: string
  eventTime?: string
  registrationStatus?: string
  waitlistPosition?: number | null
}

const Row = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Text style={row}>
    <span style={labelStyle}>{label}:</span>{' '}
    <span style={valueStyle}>{value || '—'}</span>
  </Text>
)

const StaffNotificationEmail = ({
  playerName, playerAge, playerDob, throwingHand, position, currentTeam,
  parentName, parentEmail, parentPhone,
  emergencyContactName, emergencyContactPhone, emergencyRelationship,
  medicalNotes, eventName, eventDate, eventTime,
  registrationStatus, waitlistPosition,
}: StaffNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New tryout registration: {playerName} for {eventName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Tryout Registration</Heading>
        <Text style={statusBadge}>
          {registrationStatus === 'waitlisted'
            ? `WAITLISTED (Position #${waitlistPosition ?? '?'})`
            : 'CONFIRMED'}
        </Text>

        <Section style={section}>
          <Heading style={h2}>Event</Heading>
          <Row label="Event" value={eventName} />
          <Row label="Date" value={eventDate} />
          <Row label="Time" value={eventTime} />
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Heading style={h2}>Player</Heading>
          <Row label="Name" value={playerName} />
          <Row label="Age" value={playerAge} />
          <Row label="DOB" value={playerDob} />
          <Row label="Throws" value={throwingHand} />
          <Row label="Position" value={position} />
          <Row label="Current Team" value={currentTeam} />
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

        {medicalNotes ? (
          <>
            <Hr style={hr} />
            <Section style={section}>
              <Heading style={h2}>Medical Notes</Heading>
              <Text style={noteBox}>{medicalNotes}</Text>
            </Section>
          </>
        ) : null}

        <Hr style={hr} />
        <Text style={footer}>
          Vault OS — 22M Baseball Tryout Registration System
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: StaffNotificationEmail,
  subject: (data: Record<string, any>) =>
    `New tryout registration: ${data.playerName ?? 'Player'} — ${data.eventName ?? 'Event'}`,
  displayName: 'Staff: New tryout registration',
  to: 'staff@methods22.com',
  previewData: {
    playerName: 'Jane Smith',
    playerAge: 11,
    playerDob: '2014-08-12',
    throwingHand: 'Right',
    position: 'Pitcher',
    currentTeam: 'Tinton Falls Little League',
    parentName: 'John Smith',
    parentEmail: 'john@example.com',
    parentPhone: '732-555-0100',
    emergencyContactName: 'Mary Smith',
    emergencyContactPhone: '732-555-0101',
    emergencyRelationship: 'Mother',
    medicalNotes: 'Mild asthma — inhaler on hand.',
    eventName: 'Spring 2026 Tryout — Ages 9-12',
    eventDate: 'Tuesday, May 26',
    eventTime: '6:00 PM – 8:30 PM',
    registrationStatus: 'pending',
    waitlistPosition: null,
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
const noteBox = { fontSize: '14px', color: '#1f1f1f', backgroundColor: '#fef3c7', padding: '12px', borderRadius: '4px', margin: '0' }
const hr = { borderColor: '#e5e7eb', margin: '20px 0' }
const footer = { fontSize: '11px', color: '#9ca3af', margin: '20px 0 0', textAlign: 'center' as const }
