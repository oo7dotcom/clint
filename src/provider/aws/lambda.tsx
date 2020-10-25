import AWS from "aws-sdk";
import React, { Component } from "react";
import { DefaultTableStyle } from "../../styles/table";
AWS.config.update({ region: "us-east-1" });

type FunctionDescription = { name: string; lastUpdated: string };
type Props = {};
type State = {
    event?: any;
    functions?: FunctionDescription[];
};

export default class Lambda extends Component<Props, State> {
    public static $ = new AWS.Lambda({ apiVersion: "2015-03-31" });

    constructor(props: Props) {
        super(props);

        this.state = {
            event: {},
            functions: [],
        } as State;
    }

    async componentDidMount() {
        await this.fetchFunctions();
    }

    async fetchFunctions() {
        const functions = await Lambda.$.listFunctions().promise();
        this.setState({
            functions:
                functions.Functions?.map((fn) => ({
                    name: fn.FunctionName || "",
                    lastUpdated: fn.LastModified || "",
                })) || [],
        });
    }

    buildTable() {
        return [
            ["Function Name", "Last Modified"],
            ...(this.state.functions || []).map((fn) => [
                fn.name,
                fn.lastUpdated,
            ]),
        ];
    }

    render() {
        return (
            <blessed-listtable
                width="90%"
                height="90%"
                top="center"
                left="center"
                rows={this.buildTable()}
                border={{ type: "line" }}
                mouse
                keys
                style={DefaultTableStyle}
            />
        );
    }
}
