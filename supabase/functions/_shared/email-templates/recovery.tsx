/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as s from './_styles.ts'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your VAULT password</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Section style={s.header}>
          <Text style={s.brand}>VAULT</Text>
          <Text style={s.tagline}>Methods 22 · Player Development</Text>
        </Section>
        <Section style={s.body}>
          <Heading style={s.h1}>Reset your password</Heading>
          <Text style={s.text}>
            We received a request to reset your password for{' '}
            <strong>{siteName}</strong>. Click below to choose a new one.
          </Text>
          <Button style={s.button} href={confirmationUrl}>
            Reset Password
          </Button>
          <div style={s.divider} />
          <Text style={{ ...s.text, fontSize: '13px', margin: 0 }}>
            Didn't request this? Ignore this email — your password stays the same.
          </Text>
        </Section>
        <Text style={s.footer}>© {new Date().getFullYear()} Methods 22 · {siteName}</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
