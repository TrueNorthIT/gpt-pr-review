import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as df from "durable-functions"
import { addCommentToPR } from "../tools/addcommenttopr";
import { submitToGpt } from "../tools/submittogpt";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    let url = req.body.resource.url;
    const client = df.getClient(context);
    const instanceId = await client.startNew('processPROrchestrator', undefined,  { url } );
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: `Started orchestration with ID = '${instanceId}'.`
    };

};

export default httpTrigger;