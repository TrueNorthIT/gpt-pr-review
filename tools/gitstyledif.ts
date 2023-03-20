import * as azdev from "azure-devops-node-api";
import * as git from "azure-devops-node-api/GitApi";

export async function gitstyledif(prUrl: string): Promise<string[]> {

    const url = new URL(prUrl);
    const [, org, project, , , , repo, , pr] = url.pathname.split('/');
    const orgUrl = `${url.origin}/${org}`;

    const rval: string[] = [];

    let token: string = process.env.PAT;
    let authHandler = azdev.getPersonalAccessTokenHandler(token);
    let connection = new azdev.WebApi(orgUrl, authHandler);

    let gitApi: git.IGitApi = await connection.getGitApi();
    const commits = await gitApi.getPullRequestCommits(repo, parseInt(pr), project);
    for await (const commit of commits) {
        const changes = await gitApi.getChanges(commit.commitId, repo, project);
        for await (const change of changes.changes) {
            const parent = await gitApi.getCommit(commit.commitId, repo, project);
            const payload = {
                "contributionIds": [
                    "ms.vss-code-web.file-diff-data-provider"
                ],
                "dataProviderContext": {
                    "properties": {
                        "repositoryId": repo,
                        "diffParameters": {
                            "includeCharDiffs": true,
                            "modifiedPath": change.item.path,
                            "modifiedVersion": `GC${change.item.commitId}`,
                            "originalPath": change.item.path,
                            "originalVersion": `GC${parent.parents[0]}`,
                            "partialDiff": true
                        }
                    }
                }
            }
            const diffsText = await (await gitApi.http.post(`https://dev.azure.com/trueNorthIT/_apis/Contribution/HierarchyQuery/project/${project}?api-version=5.1-preview`, JSON.stringify(payload), { "Content-Type": "application/json" })).readBody();
            const diffs = JSON.parse(diffsText);

            const filename = diffs.dataProviders['ms.vss-code-web.file-diff-data-provider']?.originalFile.contentMetadata.fileName;
            // dont inclide .lock file
            if (filename?.endsWith('package-lock.json')) continue;
            rval.push(`\n${filename}\n`)
            if (diffs.dataProviders['ms.vss-code-web.file-diff-data-provider']?.blocks) {
                const blocks = diffs.dataProviders['ms.vss-code-web.file-diff-data-provider'].blocks;
                for (const block of blocks) {
                    const changeType = block.changeType;
                    let lineNumber: number;

                    switch (changeType) {
                        case 0:
                            for (let i = 0; i < block.oLines.length; i++) {
                                lineNumber = block.oLine + i;
                                rval.push(`${lineNumber} ${block.oLines[i]}`);
                            }
                            break;
                        case 1:
                            for (let i = 0; i < block.mLines.length; i++) {
                                lineNumber = block.mLine + i;
                                rval.push(`${lineNumber} + ${block.mLines[i]}`);
                            }
                            break;
                        case 2:
                            for (let i = 0; i < block.oLines.length; i++) {
                                lineNumber = block.oLine + i;
                                rval.push(`${lineNumber} - ${block.oLines[i]}`);
                            }
                            break;
                        case 3:
                            lineNumber = block.oLine;
                            rval.push(`${lineNumber} - ${block.oLines[0]}`);
                            rval.push(`${lineNumber} + ${block.mLines[0]}`);
                            break;
                    }
                }
            }

        }
    }
    return rval;
}


