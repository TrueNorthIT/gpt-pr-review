/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 * 
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your 
 *    function app in Kudu
 */

import * as df from "durable-functions"

const orchestrator = df.orchestrator(function* (context) {
    const outputs = [];
    // Replace "Hello" with the name of your Durable Activity Function.
    outputs.push(yield context.df.callActivity("ExtractDiffsFromPR",context.bindingData.input.url));
    // now we should have the output from ExtractDiffsFromPR
    outputs.push(yield context.df.callActivity("AskChatGPT",outputs[0]));
    outputs.push(yield context.df.callActivity("CommentOnPR", { url: context.bindingData.input.url, comment: outputs[1] } ));
    return outputs;
});

export default orchestrator;
