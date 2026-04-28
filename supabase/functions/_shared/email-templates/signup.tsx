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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email to activate your VAULT account</Preview>
    <Body style={s.main}>
      <Container style={s.container}>
        <Section style={s.header}>
          <Text style={s.brand}>VAULT</Text>
          <Text style={s.tagline}>Methods 22 · Player Development</Text>
        </Section>
        <Section style={s.body}>
          <Heading style={s.h1}>Confirm your email</Heading>
          <Text style={s.text}>
            Welcome to <strong>{siteName}</strong>. Confirm{' '}
            <Link href={`mailto:${recipient}`} style={s.link}>{recipient}</Link>{' '}
            to activate your account and access your training.
          </Text>
          <Button style={s.button} href={confirmationUrl}>
            Confirm Email
          </Button>
          <div style={s.divider} />
          <Text style={{ ...s.text, fontSize: '13px', margin: 0 }}>
            Didn't sign up? You can safely ignore this email.
          </Text>
        </Section>
        <Text style={s.footer}>
          © {new Date().getFullYear()} Methods 22 · {siteName}
          <br />
          <Link href={siteUrl} style={{ ...s.link, color: '#999' }}>{siteUrl}</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
