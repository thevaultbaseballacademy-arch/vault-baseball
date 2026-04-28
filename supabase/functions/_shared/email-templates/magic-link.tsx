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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your secure login link for {siteName}</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Section style={s.header}>
          <Text style={s.brand}>VAULT</Text>
          <Text style={s.tagline}>Methods 22 · Player Development</Text>
        </Section>
        <Section style={s.body}>
          <Heading style={s.h1}>Sign in to {siteName}</Heading>
          <Text style={s.text}>
            Click below to securely sign in. This link will expire shortly.
          </Text>
          <Button style={s.button} href={confirmationUrl}>
            Sign In
          </Button>
          <div style={s.divider} />
          <Text style={{ ...s.text, fontSize: '13px', margin: 0 }}>
            Didn't request this? You can safely ignore this email.
          </Text>
        </Section>
        <Text style={s.footer}>© {new Date().getFullYear()} Methods 22 · {siteName}</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
