import React, { Component } from "react";
import { render } from "react-blessed";
import * as blessed from "blessed";
import SQS from "./provider/aws/sqs";

class App extends Component {
    render() {
        return <SQS />;
    }
}

async function run() {
    const screen = blessed.screen({
        smartCSR: true,
        autoPadding: true,
        title: "Janelinha",
    });

    screen.key(["escape", "q", "C-c"], () => process.exit(0));
    render(<App />, screen);
}

run();
