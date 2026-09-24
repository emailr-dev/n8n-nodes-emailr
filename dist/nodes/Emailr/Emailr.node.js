"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emailr = void 0;
class Emailr {
    description = {
        displayName: "Emailr",
        name: "emailr",
        icon: "file:emailr.png",
        group: ["transform"],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: "Send emails via Emailr",
        defaults: {
            name: "Emailr",
        },
        usableAsTool: true,
        inputs: ["main"],
        outputs: ["main"],
        credentials: [
            {
                name: "emailrApi",
                required: true,
            },
        ],
        properties: [
            {
                displayName: "Operation",
                name: "operation",
                type: "options",
                noDataExpression: true,
                options: [
                    {
                        name: "Send Email",
                        value: "sendEmail",
                        description: "Send an email via Emailr",
                        action: "Send an email",
                    },
                ],
                default: "sendEmail",
            },
            {
                displayName: "From",
                name: "from",
                type: "string",
                default: "",
                required: true,
                placeholder: "Name <sender@yourdomain.com>",
                description: "Sender email. Use \"Name <email>\" or \"email\" format. Must be a verified domain.",
                displayOptions: {
                    show: {
                        operation: ["sendEmail"],
                    },
                },
            },
            {
                displayName: "To",
                name: "to",
                type: "string",
                default: "",
                required: true,
                placeholder: "recipient@example.com",
                description: "Recipient email address",
                displayOptions: {
                    show: {
                        operation: ["sendEmail"],
                    },
                },
            },
            {
                displayName: "Subject",
                name: "subject",
                type: "string",
                default: "",
                required: true,
                description: "Email subject line",
                displayOptions: {
                    show: {
                        operation: ["sendEmail"],
                    },
                },
            },
            {
                displayName: "HTML Body",
                name: "html",
                type: "string",
                typeOptions: {
                    rows: 5,
                },
                default: "",
                description: "HTML content of the email",
                displayOptions: {
                    show: {
                        operation: ["sendEmail"],
                    },
                },
            },
            {
                displayName: "Text Body",
                name: "text",
                type: "string",
                typeOptions: {
                    rows: 5,
                },
                default: "",
                description: "Plain text content of the email",
                displayOptions: {
                    show: {
                        operation: ["sendEmail"],
                    },
                },
            },
            {
                displayName: "Reply-To",
                name: "replyTo",
                type: "string",
                default: "",
                description: "Reply-To email address",
                displayOptions: {
                    show: {
                        operation: ["sendEmail"],
                    },
                },
            },
            {
                displayName: "CC",
                name: "cc",
                type: "string",
                default: "",
                description: "Comma-separated CC email addresses",
                displayOptions: {
                    show: {
                        operation: ["sendEmail"],
                    },
                },
            },
            {
                displayName: "BCC",
                name: "bcc",
                type: "string",
                default: "",
                description: "Comma-separated BCC email addresses",
                displayOptions: {
                    show: {
                        operation: ["sendEmail"],
                    },
                },
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials("emailrApi");
        const apiUrl = credentials.apiUrl;
        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter("operation", i);
            if (operation === "sendEmail") {
                const body = {
                    from: this.getNodeParameter("from", i),
                    to: this.getNodeParameter("to", i),
                    subject: this.getNodeParameter("subject", i),
                };
                const html = this.getNodeParameter("html", i);
                const text = this.getNodeParameter("text", i);
                const replyTo = this.getNodeParameter("replyTo", i);
                const cc = this.getNodeParameter("cc", i);
                const bcc = this.getNodeParameter("bcc", i);
                if (html)
                    body.html = html;
                if (text)
                    body.text = text;
                if (replyTo)
                    body.reply_to_email = replyTo;
                if (cc)
                    body.cc = cc
                        .split(",")
                        .map((e) => e.trim())
                        .filter(Boolean);
                if (bcc)
                    body.bcc = bcc
                        .split(",")
                        .map((e) => e.trim())
                        .filter(Boolean);
                const response = await this.helpers.httpRequestWithAuthentication.call(this, "emailrApi", {
                    method: "POST",
                    url: `${apiUrl}/v1/emails/send`,
                    body,
                });
                returnData.push({ json: response });
            }
        }
        return [returnData];
    }
}
exports.Emailr = Emailr;
