import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  playerName?: string
  eventName?: string
}

const TryoutCancellation = ({
  playerName = 'your player',
  eventName = 'the tryout',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your spot has been released</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Spot released</Heading>
        <Text style={text}>
          We've cancelled {playerName}'s registration for <strong>{eventName}</strong>. The spot is now open for someone else.
        </Text>
        <Text style={text}>
          Hope to see you at a future event. — The 22M Baseball Staff
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TryoutCancellation,
  subject: 'Your tryout registration has been cancelled',
  displayName: 'Tryout cancellation',
  previewData: {
    playerName: 'Jake',
    eventName: 'Spring 2026 Tryout — 9-12 Group',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#333', lineHeight: '1.6', margin: '0 0 16px' }
