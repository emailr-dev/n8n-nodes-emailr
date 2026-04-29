# n8n-nodes-emailr

This is an [n8n](https://n8n.io/) community node package for [Emailr](https://emailr.dev).

It provides two nodes:

- `Emailr`: send email through Emailr
- `Emailr Trigger`: start workflows when an email is received

Use this package when you want to send transactional email from n8n workflows or start workflows from incoming email events in Emailr.

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

In n8n, install:

```text
n8n-nodes-emailr
```

## Credentials

Use an Emailr API key and API URL:

- `API Key`: starts with `et_test_` or `et_live_`
- `API URL`: defaults to `https://api.emailr.dev`

Create an API credential in n8n, select `Emailr API`, then paste your Emailr API key. Keep the default API URL unless you are using a self-hosted Emailr API.

## Usage

### Send Email

1. Add the `Emailr` node to your workflow.
2. Select the `Send Email` operation.
3. Fill in `From`, `To`, and `Subject`.
4. Add either `HTML Body`, `Text Body`, or both.
5. Execute the node.

Example configuration:

- `From`: `Support <support@yourdomain.com>`
- `To`: `customer@example.com`
- `Subject`: `Welcome to Emailr`
- `Text Body`: `Thanks for signing up.`
- `HTML Body`: `<p>Thanks for signing up.</p>`

The node sends a `POST` request to Emailr's `/v1/emails/send` endpoint and returns the Emailr API response as the node output, which you can use in later workflow steps.

### Email Trigger

1. Add the `Emailr Trigger` node to your workflow.
2. Select the `Email Received` event.
3. Choose a specific inbox or leave `Inbox` set to `All Inboxes`.
4. Activate the workflow.

When the workflow is activated, the node registers the n8n webhook URL with Emailr by creating an automation webhook. When the workflow is deactivated, the webhook subscription is removed.

The trigger passes the incoming event payload into the workflow. The node forwards `body.data` when present, otherwise it forwards the full webhook body.

Example incoming payload:

```json
{
  "id": "eml_123",
  "inbox_id": "inb_123",
  "from": "sender@example.com",
  "to": ["support@yourdomain.com"],
  "subject": "Need help",
  "text": "Can you help me with my account?",
  "html": "<p>Can you help me with my account?</p>"
}
```

You can connect the trigger to downstream n8n nodes to create tickets, notify Slack, update a CRM, or send an automated reply.

## Resources

- [Emailr](https://emailr.dev)
- [Emailr Docs](https://docs.emailr.dev)

## License

MIT
