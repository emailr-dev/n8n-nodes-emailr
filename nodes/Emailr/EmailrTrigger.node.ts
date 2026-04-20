import type {
  IHookFunctions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  IDataObject,
  INodePropertyOptions,
} from "n8n-workflow";

export class EmailrTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Emailr Trigger",
    name: "emailrTrigger",
    icon: "file:emailr.png",
    group: ["trigger"],
    version: 1,
    subtitle: '=Email Received',
    description: "Starts a workflow when an email is received via Emailr",
    defaults: {
      name: "Emailr Trigger",
    },
    inputs: [],
    outputs: ["main"],
    credentials: [
      {
        name: "emailrApi",
        required: true,
      },
    ],
    webhooks: [
      {
        name: "default",
        httpMethod: "POST",
        responseMode: "onReceived",
        path: "webhook",
      },
    ],
    properties: [
      {
        displayName: "Event",
        name: "event",
        type: "options",
        options: [
          {
            name: "Email Received",
            value: "email.received",
          },
        ],
        default: "email.received",
        required: true,
        description: "The event to listen for",
      },
      {
        displayName: "Inbox",
        name: "inboxId",
        type: "options",
        typeOptions: {
          loadOptionsMethod: "getInboxes",
        },
        default: "",
        description: "Only trigger for emails received in this inbox. Leave empty for all inboxes.",
      },
    ],
  };

  methods = {
    loadOptions: {
      async getInboxes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const credentials = await this.getCredentials("emailrApi");
        const apiUrl = credentials.apiUrl as string;

        const response = await this.helpers.httpRequestWithAuthentication.call(this, "emailrApi", {
          method: "GET",
          url: `${apiUrl}/v1/automation-webhooks/inboxes`,
        });

        const options: INodePropertyOptions[] = [
          {
            name: "All Inboxes",
            value: "",
          },
        ];

        for (const inbox of response as IDataObject[]) {
          options.push({
            name: `${inbox.name} (${inbox.email})`,
            value: inbox.id as string,
          });
        }

        return options;
      },
    },
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData("node");
        const webhookUrl = this.getNodeWebhookUrl("default") as string;
        const credentials = await this.getCredentials("emailrApi");
        const apiUrl = credentials.apiUrl as string;

        const response = await this.helpers.httpRequestWithAuthentication.call(this, "emailrApi", {
          method: "GET",
          url: `${apiUrl}/v1/automation-webhooks`,
        });

        for (const hook of response as IDataObject[]) {
          if (hook.target_url === webhookUrl && hook.active) {
            webhookData.webhookId = hook.id;
            return true;
          }
        }
        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl("default") as string;
        const credentials = await this.getCredentials("emailrApi");
        const apiUrl = credentials.apiUrl as string;
        const event = this.getNodeParameter("event") as string;
        const inboxId = this.getNodeParameter("inboxId") as string;

        const body: IDataObject = {
          target_url: webhookUrl,
          event_type: event,
          provider: "n8n",
        };

        if (inboxId) {
          body.inbox_ids = [inboxId];
        }

        const response = await this.helpers.httpRequestWithAuthentication.call(this, "emailrApi", {
          method: "POST",
          url: `${apiUrl}/v1/automation-webhooks/subscribe`,
          body,
        });

        const webhookData = this.getWorkflowStaticData("node");
        webhookData.webhookId = (response as IDataObject).id;
        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl("default") as string;
        const credentials = await this.getCredentials("emailrApi");
        const apiUrl = credentials.apiUrl as string;

        try {
          await this.helpers.httpRequestWithAuthentication.call(this, "emailrApi", {
            method: "DELETE",
            url: `${apiUrl}/v1/automation-webhooks/unsubscribe`,
            body: {
              target_url: webhookUrl,
            },
          });
        } catch (error) {
          // Ignore errors on delete — webhook may already be removed
        }
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData() as IDataObject;
    const eventData = (bodyData.data as IDataObject) || bodyData;

    return {
      workflowData: [this.helpers.returnJsonArray(eventData)],
    };
  }
}
