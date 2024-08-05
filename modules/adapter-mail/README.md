# @kotori-bot/adapter-mail

Supports for email. Such as `Google Mail`, `QQ Mail`, `163 Mail` and more...

## Config

```typescript
export const config = Tsu.Object({
  title: Tsu.String().domain().default('Love from kotori bot mailer').describe('Mail default title'),
  user: Tsu.String().describe('Email address'),
  password: Tsu.String().describe('Email password'),
  imapHost: Tsu.String().domain().describe('IMAP server host'),
  imapPort: Tsu.Number().describe('IMAP server port'),
  smtpHost: Tsu.String().domain().describe('SMTP server host'),
  smtpPort: Tsu.Number().describe('SMTP server port')
})
```

## Supports

### Events

- on_message (only `MessageScope.PRIVATE`)

### Api

- sendPrivateMsg

### Elements

- text
- mention
- image
- voice
- video
- file
- reply

## Reference

- [Kotori Docs](https://kotori.js.org/)
