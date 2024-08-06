# @kotori-bot/adapter-mail

Supports for email. Such as `Google Mail`, `QQ Mail`, `163 Mail` and more...

## Config

```typescript
export const config = Tsu.Object({
  title: Tsu.String().domain().default('Love from kotori bot mailer').describe('Mail default title'),
  commandEnable: Tsu.Boolean()
    .default(true)
    .describe("Whether to enable command, other bot's master can send mail by the command, please set at top mail bot"),
  forward: Tsu.Array(Tsu.String())
    .default([])
    .describe("bots' identity, will forward to the bot's master on receiving mail, please set at top mail bot"),
  user: Tsu.String().describe('Email address'),
  interval: Tsu.Number().default(60).describe('Check mail interval (seconds)'),
  password: Tsu.String().describe('Email password'),
  imapHost: Tsu.String().describe('IMAP server host'),
  imapPort: Tsu.Number().describe('IMAP server port'),
  smtpHost: Tsu.String().describe('SMTP server host'),
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
