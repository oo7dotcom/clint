import AWS from "aws-sdk";
import React, { Component } from "react";
AWS.config.update({ region: "us-east-1" });

type Props = {};
type State = {};

export default class TableMigrationUtil extends Component<Props, State> {
    // public static $ = new AWS.Lambda({ apiVersion: '2015-03-31' })

    constructor(props: Props) {
        super(props);

        this.state = {
            event: {},
            functions: [],
        } as State;
    }

    async componentDidMount() {
        // await this.fetchFunctions()
    }

    submit(data: string) {
        console.log(data);
    }

    render() {
        return (
            <blessed-box
                width="90%"
                height="90%"
                top="center"
                left="center"
                border={{ type: "line" }}
                mouse
            >
                <blessed-form>
                    <blessed-textbox
                        onInput={this.submit}
                        left="10"
                        height="3"
                        keys
                        mouse
                        inputOnFocus
                    />
                </blessed-form>
            </blessed-box>
        );
    }
}
