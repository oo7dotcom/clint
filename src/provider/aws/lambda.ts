import AWS from "aws-sdk";
import { YargsInstance } from "../../common/module";
AWS.config.update({ region: "us-east-1" });

export default class Lambda {
    public static $ = new AWS.Lambda({ apiVersion: "2015-03-31" });

    public static async fetchFunctions() {
        const functions = await Lambda.$.listFunctions().promise();
        return (
            functions.Functions?.map((fn) => ({
                name: fn.FunctionName || "",
                lastUpdated: fn.LastModified || "",
            })) || []
        );
    }

    public static register(instance: YargsInstance) {
        return instance.command(
            "function ls",
            "Lists every function",
            {},
            async (argv) => {
                const fnList = await this.fetchFunctions();
                console.log(
                    fnList.map(
                        ({ name, lastUpdated }) => `${name} | ${lastUpdated}`
                    )
                );
            }
        );
    }
}
