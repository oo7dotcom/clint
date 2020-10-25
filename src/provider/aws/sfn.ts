import { YargsInstance } from "../../common/module";
import AWS from "aws-sdk";
AWS.config.update({ region: "us-east-1" });

export default class SFN {
    public static $ = new AWS.StepFunctions();

    public static async listStateMachines(
        token: string | undefined = undefined
    ) {
        var sfns: any[] = [];
        var params: { maxResults: number; [x: string]: any } = {
            maxResults: 1000,
        };
        if (token) params["nextToken"] = token;
        try {
            const { stateMachines, nextToken } = await SFN.$.listStateMachines(
                params
            ).promise();
            sfns =
                stateMachines.map((element) => {
                    return {
                        arn: element.stateMachineArn,
                        name: element.name,
                        type: element.type,
                    };
                }) || [];
            if (nextToken)
                sfns = sfns.concat(await this.listStateMachines(nextToken));
        } catch (e) {
            console.error("Error ", e);
            throw new Error(e);
        }
        return sfns;
    }

    public static async listStateMachineExecutions(
        arn: string,
        filter: string | undefined = undefined,
        next_token: string | undefined = undefined
    ) {
        var params: {
            stateMachineArn: string;
            maxResults: number;
            [x: string]: any;
        };
        params = { stateMachineArn: arn, maxResults: 1000 };
        if (filter) params["statusFilter"] = filter;
        if (next_token) params["nextToken"] = next_token;
        const { executions, nextToken } = await SFN.$.listExecutions(
            params
        ).promise();
        return executions.map((element) => {
            return {
                executionArn: element.executionArn,
                name: element.name,
                status: element.status,
            };
        });
    }

    public static async invokeStateMachine(
        arn: string,
        event: Object,
        name: string | undefined = undefined
    ) {
        var params: {
            stateMachineArn: string;
            input: string;
            name: string | undefined;
        };

        var params = {
            stateMachineArn: arn,
            input: JSON.stringify(event),
            name,
        };
        const { executionArn } = await SFN.$.startExecution(params).promise();
        return executionArn;
    }

    public static async watchExecution(
        executionArn: string,
        filter: string | undefined = undefined,
        next_token: string | undefined = undefined
    ) {
        var params: { executionArn: string; [x: string]: any };
        params = { executionArn };
        if (next_token) params["nextToken"] = next_token;

        const { events, nextToken } = await SFN.$.getExecutionHistory(
            params
        ).promise();
        var executions =
            events.map((element) => {
                return {
                    id: element.id,
                    timestamp: element.timestamp,
                    type: element.type,
                };
            }) || [];
        if (filter) {
            executions = executions.filter(
                (element) => element.type === filter
            );
        }
        if (nextToken) {
            var temp = await this.watchExecution(
                executionArn,
                filter,
                nextToken
            );
            executions = executions.concat(temp);
        }
        return executions;
    }

    public static async stopExecution(executionArn: string) {
        var params = {
            executionArn,
        };
        SFN.$.stopExecution(params, function (err, data) {
            if (err) console.log(err, err.stack);
            // an error occurred
            else console.log(data); // successful response
        });
    }

    public static register(instance: YargsInstance) {
        instance.command(
            "sfn ls",
            "Lists every state machines",
            {},
            async (argv) => {
                const fnList = await this.listStateMachines();
                console.log(fnList);
            }
        );
        return instance;
    }
}
