/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as s from './_styles.ts'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Section style={s.header}>
          <Text style={s.brand}>VAULT</Text>
          <Text style={s.tagline}>Methods 22 · Player Development</Text>
        </Section>
        <Section style={s.body}>
          <Heading style={s.h1}>You're invited</Heading>
          <Text style={s.text}>
            You've been invited to join{' '}
            <Link href={siteUrl} style={s.link}><strong>{siteName}</strong></Link>.
            Accept the invitation below to create your account and get started.
          </Text>
          <Button style={s.button} href={confirmationUrl}>
            Accept Invitation
          </Button>
          <div style={s.divider} />
          <Text style={{ ...s.text, fontSize: '13px', margin: 0 }}>
            Not expecting this? You can safely ignore this email.
          </Text>
        </Section>
        <Text style={s.footer}>© {new Date().getFullYear()} Methods 22 · {siteName}</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
