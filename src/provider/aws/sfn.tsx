import AWS from "aws-sdk";
AWS.config.update({ region: "us-east-1" });

export default class SFN {
    public static $ = new AWS.StepFunctions();

    sfns: { arn: string; name: string; type: string }[];

    constructor() {
        this.sfns = [];
    }

    public async listStepFunctions(token: string | undefined = undefined) {
        var params: { maxResults: number; [x: string]: any } = {
            maxResults: 1000,
        };
        if (token) params["nextToken"] = token;
        try {
            const { stateMachines, nextToken } = await SFN.$.listStateMachines(
                params
            ).promise();
            this.sfns = this.sfns.concat(
                stateMachines.map((element) => {
                    return {
                        arn: element.stateMachineArn,
                        name: element.name,
                        type: element.type,
                    };
                }) || []
            );
            if (nextToken) this.listStepFunctions(nextToken);
        } catch (e) {
            console.error("Error ", e);
            throw new Error(e);
        }
        return this.sfns;
    }

    async listStateMachineExecutions(
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

    async invokeStateMachine(
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

    async watchExecution(
        executionArn: string,
        filter: string | undefined = undefined
    ) {
        const { events } = await SFN.$.getExecutionHistory({
            executionArn,
        }).promise();
        var executions = events.map((element) => {
            return {
                id: element.id,
                timestamp: element.timestamp,
                type: element.type,
            };
        });
        if (filter) {
            executions = executions.filter(
                (element) => element.type === filter
            );
        }
        return executions;
    }

    async stopExecution(executionArn: string) {
        var params = {
            executionArn,
        };
        SFN.$.stopExecution(params, function (err, data) {
            if (err) console.log(err, err.stack);
            // an error occurred
            else console.log(data); // successful response
        });
    }
}
