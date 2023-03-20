import * as azdev from "azure-devops-node-api";
import * as git from "azure-devops-node-api/GitApi";
import { CommentThread, CommentType } from "azure-devops-node-api/interfaces/GitInterfaces";
import { submitToGpt } from "./submittogpt";

export async function addCommentToPR(prUrl: string, content: string): Promise<void> {

    const url = new URL(prUrl);
    const [, org, project, , , , repo, , pr] = url.pathname.split('/');
    const orgUrl = `${url.origin}/${org}`;

    let token: string = process.env.PAT;
    let authHandler = azdev.getPersonalAccessTokenHandler(token);
    let connection = new azdev.WebApi(orgUrl, authHandler);

    let gitApi: git.IGitApi = await connection.getGitApi();

    const jsonComment  = {
        
        "id": -1,
        "comments": [
          {

            "author": { 
              id: "00000000-0000-0000-0000-000000000000",
              displayName: "ChatGPT" ,
              uniqueName: "ChatGPT",

            },
            
            "commentType": 1,
            "content": content
          }
        ],
        "status": 1,
        "properties": {
          "Microsoft.TeamFoundation.Discussion.SupportsMarkdown": {
            "type": "System.Int32",
            "value": 1
          },
        
        }
      } as CommentThread;

    const body = JSON.stringify(jsonComment);
    await gitApi.createComment( jsonComment , repo, parseInt(pr), 0,project);
}
