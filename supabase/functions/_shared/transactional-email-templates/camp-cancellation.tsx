import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  playerName?: string
  campName?: string
  refundNote?: string
}

const CampCancellation = ({
  playerName = 'your player',
  campName = 'the camp',
  refundNote,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your camp registration has been cancelled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Registration cancelled</Heading>
        <Text style={text}>
          We've cancelled {playerName}'s registration for <strong>{campName}</strong>. The spot is now open.
        </Text>
        {refundNote && <Text style={text}>{refundNote}</Text>}
        <Text style={text}>Hope to see you at a future camp. — The 22M Baseball Staff</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CampCancellation,
  subject: 'Your camp registration has been cancelled',
  displayName: 'Camp cancellation',
  previewData: {
    playerName: 'Jake',
    campName: '22M Elite Summer Development Camp — Ages 7–10',
    refundNote: 'Refunds are processed within 5–7 business days per our cancellation policy.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#333', lineHeight: '1.6', margin: '0 0 16px' }
