import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from "n8n-workflow";

export class Emailr implements INodeType {
  description: INodeTypeDescription = {
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
        description:
          "Sender email. Use \"Name <email>\" or \"email\" format. Must be a verified domain.",
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

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials("emailrApi");
    const apiUrl = credentials.apiUrl as string;

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter("operation", i) as string;

      if (operation === "sendEmail") {
        const body: IDataObject = {
          from: this.getNodeParameter("from", i) as string,
          to: this.getNodeParameter("to", i) as string,
          subject: this.getNodeParameter("subject", i) as string,
        };

        const html = this.getNodeParameter("html", i) as string;
        const text = this.getNodeParameter("text", i) as string;
        const replyTo = this.getNodeParameter("replyTo", i) as string;
        const cc = this.getNodeParameter("cc", i) as string;
        const bcc = this.getNodeParameter("bcc", i) as string;

        if (html) body.html = html;
        if (text) body.text = text;
        if (replyTo) body.reply_to_email = replyTo;
        if (cc)
          body.cc = cc
            .split(",")
            .map((e: string) => e.trim())
            .filter(Boolean);
        if (bcc)
          body.bcc = bcc
            .split(",")
            .map((e: string) => e.trim())
            .filter(Boolean);

        const response = await this.helpers.httpRequestWithAuthentication.call(this, "emailrApi", {
          method: "POST",
          url: `${apiUrl}/v1/emails/send`,
          body,
        });

        returnData.push({ json: response as IDataObject });
      }
    }

    return [returnData];
  }
}
