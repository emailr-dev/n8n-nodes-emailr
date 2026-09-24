import type { IHookFunctions, ILoadOptionsFunctions, IWebhookFunctions, INodeType, INodeTypeDescription, IWebhookResponseData, INodePropertyOptions } from "n8n-workflow";
export declare class EmailrTrigger implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getInboxes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    webhookMethods: {
        default: {
            checkExists(this: IHookFunctions): Promise<boolean>;
            create(this: IHookFunctions): Promise<boolean>;
            delete(this: IHookFunctions): Promise<boolean>;
        };
    };
    webhook(this: IWebhookFunctions): Promise<IWebhookResponseData>;
}
