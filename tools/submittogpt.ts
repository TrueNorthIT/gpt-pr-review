import * as openai from 'openai';

export async function submitToGpt(lines: string[]) : Promise<string> {

    const { Configuration, OpenAIApi } = require("openai");

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system", content: "You are a code review expert, when you review you summarise the change and assess the impact of the change. You never say It is difficult to assess as you will only ever have the changes. Do your best" 
            },
            { 
                role: "user", content: `please review this change \n ${lines}` 
            }],
    });
    return completion.data.choices[0].message;

}

const lines =
    `[
840             },'
841             {'
842               "value": "Yes (Continuing Care)",'
843 -               "category": 876080002'
843 +               "category": 876080003'
844             },'
845             {'
846               "value": "No",'
847 -               "category": 876080002'
847 +               "category": 876080004'
848             },'
849             {'
850               "value": "Not known",'
851 -               "category": 876080002'
851 +               "category": 876080005'
852             }
853           ]
854         }
]`

//submitToGpt(lines.split("\n")).then((r) => console.log(r));