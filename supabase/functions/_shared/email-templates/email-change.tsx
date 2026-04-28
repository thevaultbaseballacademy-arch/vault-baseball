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

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new email for {siteName}</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Section style={s.header}>
          <Text style={s.brand}>VAULT</Text>
          <Text style={s.tagline}>Methods 22 · Player Development</Text>
        </Section>
        <Section style={s.body}>
          <Heading style={s.h1}>Confirm email change</Heading>
          <Text style={s.text}>
            You requested to change your email for <strong>{siteName}</strong> from{' '}
            <Link href={`mailto:${email}`} style={s.link}>{email}</Link> to{' '}
            <Link href={`mailto:${newEmail}`} style={s.link}>{newEmail}</Link>.
          </Text>
          <Button style={s.button} href={confirmationUrl}>
            Confirm Change
          </Button>
          <div style={s.divider} />
          <Text style={{ ...s.text, fontSize: '13px', margin: 0 }}>
            Didn't request this? Secure your account immediately.
          </Text>
        </Section>
        <Text style={s.footer}>© {new Date().getFullYear()} Methods 22 · {siteName}</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
