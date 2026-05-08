import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  Icon,
  INodeProperties,
} from "n8n-workflow";

export class EmailrApi implements ICredentialType {
  name = "emailrApi";
  displayName = "Emailr API";
  icon: Icon = "file:../nodes/Emailr/emailr.png";
  documentationUrl = "https://docs.emailr.dev";
  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      placeholder: "et_live_...",
      description:
        "Your Emailr API key. Starts with et_test_ (development) or et_live_ (production).",
    },
    {
      displayName: "API URL",
      name: "apiUrl",
      type: "string",
      default: "https://api.emailr.dev",
      description: "Emailr API base URL. Only change for custom deployments.",
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        Authorization: "=Bearer {{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "={{$credentials.apiUrl}}",
      url: "/v1/automation-webhooks/inboxes",
      method: "GET",
    },
  };
}
