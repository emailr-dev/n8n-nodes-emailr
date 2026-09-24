"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailrTrigger = void 0;
class EmailrTrigger {
    description = {
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
            async getInboxes() {
                const credentials = await this.getCredentials("emailrApi");
                const apiUrl = credentials.apiUrl;
                const response = await this.helpers.httpRequestWithAuthentication.call(this, "emailrApi", {
                    method: "GET",
                    url: `${apiUrl}/v1/automation-webhooks/inboxes`,
                });
                const options = [
                    {
                        name: "All Inboxes",
                        value: "",
                    },
                ];
                for (const inbox of response) {
                    options.push({
                        name: `${inbox.name} (${inbox.email})`,
                        value: inbox.id,
                    });
                }
                return options;
            },
        },
    };
    webhookMethods = {
        default: {
            async checkExists() {
                const webhookData = this.getWorkflowStaticData("node");
                const webhookUrl = this.getNodeWebhookUrl("default");
                const credentials = await this.getCredentials("emailrApi");
                const apiUrl = credentials.apiUrl;
                const response = await this.helpers.httpRequestWithAuthentication.call(this, "emailrApi", {
                    method: "GET",
                    url: `${apiUrl}/v1/automation-webhooks`,
                });
                for (const hook of response) {
                    if (hook.target_url === webhookUrl && hook.active) {
                        webhookData.webhookId = hook.id;
                        return true;
                    }
                }
                return false;
            },
            async create() {
                const webhookUrl = this.getNodeWebhookUrl("default");
                const credentials = await this.getCredentials("emailrApi");
                const apiUrl = credentials.apiUrl;
                const event = this.getNodeParameter("event");
                const inboxId = this.getNodeParameter("inboxId");
                const body = {
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
                webhookData.webhookId = response.id;
                return true;
            },
            async delete() {
                const webhookUrl = this.getNodeWebhookUrl("default");
                const credentials = await this.getCredentials("emailrApi");
                const apiUrl = credentials.apiUrl;
                const webhookData = this.getWorkflowStaticData("node");
                try {
                    await this.helpers.httpRequestWithAuthentication.call(this, "emailrApi", {
                        method: "DELETE",
                        url: `${apiUrl}/v1/automation-webhooks/unsubscribe`,
                        body: {
                            target_url: webhookUrl,
                        },
                    });
                }
                catch (error) {
                    // Ignore errors on delete — webhook may already be removed
                }
                delete webhookData.webhookId;
                return true;
            },
        },
    };
    async webhook() {
        const bodyData = this.getBodyData();
        const eventData = bodyData.data || bodyData;
        return {
            workflowData: [this.helpers.returnJsonArray(eventData)],
        };
    }
}
exports.EmailrTrigger = EmailrTrigger;
