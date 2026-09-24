"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailrApi = void 0;
class EmailrApi {
    name = "emailrApi";
    displayName = "Emailr API";
    icon = "file:../nodes/Emailr/emailr.png";
    documentationUrl = "https://docs.emailr.dev";
    properties = [
        {
            displayName: "API Key",
            name: "apiKey",
            type: "string",
            typeOptions: { password: true },
            default: "",
            required: true,
            placeholder: "et_live_...",
            description: "Your domain workspace API key. Select the domain in Emailr before creating the key. Use a separate connection for each domain. Legacy account-wide keys must be replaced. Starts with et_test_ (development) or et_live_ (production).",
        },
        {
            displayName: "API URL",
            name: "apiUrl",
            type: "string",
            default: "https://api.emailr.dev",
            description: "Emailr API base URL. Only change for custom deployments.",
        },
    ];
    authenticate = {
        type: "generic",
        properties: {
            headers: {
                Authorization: "=Bearer {{$credentials.apiKey}}",
            },
        },
    };
    test = {
        request: {
            baseURL: "={{$credentials.apiUrl}}",
            url: "/v1/automation-webhooks/inboxes",
            method: "GET",
        },
    };
}
exports.EmailrApi = EmailrApi;
