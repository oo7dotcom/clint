import AWS from "aws-sdk";
import React, { Component } from "react";
AWS.config.update({ region: "us-east-1" });

type Props = {};
type State = {
    sfns: { arn: string; name: string; type: string }[];
};

export default class SFN extends Component<Props, State> {
    public static $ = new AWS.StepFunctions();
    private static tableStyle = {
        fg: "black",
        bg: "white",
        shadow: true,
        selected: {
            bold: true,
        },
        item: {
            hover: {
                bg: "black",
                fg: "white",
            },
        },
        header: {
            bold: true,
        },
    };

    state: State;
    sfns: { arn: string; name: string; type: string }[];

    constructor(props: any) {
        super(props);

        this.state = { sfns: [] } as any;
        this.sfns = [];
        this.setState(this.state);
    }

    async componentDidMount() {
        await this.runner();
    }

    buildTable(state: State) {
        return [["Arn", "Name", " Type"], ...state.sfns];
    }

    public async runner() {
        await this.listStepFunctions();
        // this.setState({ sfns: this.sfns })
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
    }

    async listStateMachineExecutions(
        arn: string,
        filter: string | undefined = undefined,
        next_token: string | undefined = undefined
    ) {
        //on Click callback for a specific state
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

    render() {
        this.listStepFunctions();
        return (
            <blessed-listtable
                width="50%"
                height="50%"
                top="bottom"
                left="bottom"
                rows={this.buildTable(this.state)}
                border={{ type: "line" }}
                mouse
                keys
                style={SFN.tableStyle}
            />
        );
    }
}
