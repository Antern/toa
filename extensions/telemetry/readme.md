# Telemetry

## Structured logs

Structured logs can be written using the `logs` Context Aspect.

```javascript
async function computation (input, context) {
  context.logs.info('Hello, world', { foo: 'bar' })
}
```

Methods `debug`, `info`, `warn`, and `error` are available to log messages with different severity
levels, with the following signature:

```
(message: string, attributes?: object) => void
```

Logs are formatted as JSON and written to stdout or stderr. The log entry format is:

```yaml
time: string      # ISO 8601 timestamp
severity: string  # DEBUG, INFO, WARN, ERROR
message: string
attributes?: object
context:
  namespace: string
  component: string
  operation: string
```

### Logs configuration

Logs can be configured using `telemetry` Context Annotation.

- `level`: limits the minimum log level.
  It can be set to `debug`, `info` (default), `warn`, or `error`.

```yaml
# context.toa.yaml

telemetry:
  logs:
    level: debug  # debug < info < warn < error
    level@production: info
```

Logs configuration can be overridden for specific components.

```yaml
# context.toa.yaml

telemetry:
  logs:
    level: info
    identity.federation:
      level: debug
```

### Logs best practices

Use constant messages and attributes to facilitate log analysis.

:-1: Don't:

```javascript
context.logs.info(`User ${user.id} created`)
```

:+1: Do:

```javascript
context.logs.info('User created', { id: user.id })
```

Use concise messages and attributes to provide context of the event, to identify the source of the
log entry.
Do not include stories, explanations, or required actions in the log message.
Logs are not comments or documentation, nor are they a replacement for them.

:-1: Don't:

```javascript
context.logs.error('Failed to send the email, please check the email server configuration')
```

:+1: Do:

```javascript
context.logs.error('Failed to send the email', {
  reason: 'SMTP error',
  status: response.statusCode
})
```

Avoid logging any information received from the user.
It may contain private, sensitive, security-related, or GDPR protected data.

:-1: Don't:

```javascript
context.logs.info('User logged in', { name: user.name })
context.logs.error('Failed to send chat message', { message: message.text })
```

:x: Never do:

```javascript
context.logs.error('Password is incorrect', { password: credentials.password })
context.logs.info('Payment received', { creditCard: card.number })
```

Choose the appropriate log level for the message:

- `debug`: Used for development and troubleshooting purposes. Should not be enabled in production.
- `info`: Tracks the application flow and provides context for events.
- `warn`: Indicates potential issues that may require attention.
- `error`: Indicates a failure or an unexpected event that requires immediate attention.

Avoid logging configuration objects, as they may contain secrets. Log specific values instead.

:-1: Don't:

```javascript
context.logs.debug('Configuration', context.configuration)
```

:+1: Do:

```javascript
context.logs.debug('Limits', {
  max: context.configuration.limits.max,
  min: context.configuration.limits.min
})
```
