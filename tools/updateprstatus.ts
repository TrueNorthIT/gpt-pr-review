import * as azdev from "azure-devops-node-api";
import * as git from "azure-devops-node-api/GitApi";

import { CommentType, GitStatusState, PullRequestStatus } from "azure-devops-node-api/interfaces/GitInterfaces";

export async function updatePrStatus(prUrl: string, content: string): Promise<void> {

    const url = new URL(prUrl);
    const [, org, project, , , , repo, , pr] = url.pathname.split('/');
    const orgUrl = `${url.origin}/${org}`;

    let token: string = process.env.PAT;
    let authHandler = azdev.getPersonalAccessTokenHandler(token);
    let connection = new azdev.WebApi(orgUrl, authHandler);

    let gitApi: git.IGitApi = await connection.getGitApi();
    
    const prstatus  =    {
      "iterationId": 1,
      "state": GitStatusState.Succeeded,
      "description": "ChatGPT",
      "context": {
        "name": "sample-status-2",
        "genre": "vsts-samples"
      },
      "targetUrl": "http://fabrikam-fiber-inc.com/CI/builds/1"
    } 
    
    gitApi.createPullRequestStatus(
        prstatus,repo,parseInt(pr),project)
    

}
