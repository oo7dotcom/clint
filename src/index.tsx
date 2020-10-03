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
    title: "Janelinha",
    autoPadding: true,
  });

  // const list = blessed.list({
  //     width: '50%',
  //     height: '50%',
  //     top: 'center',
  //     left: 'center',
  //     items: await SQS.fetchQueues(),
  //     border: {
  //         type: 'line'
  //     },
  //     interactive: true,
  //     mouse: true,
  //     keys: true
  // })

  // list.on('select item', (item) => {
  //     console.log(item.content)
  // })

  // screen.append(list)

  screen.key(["escape", "q", "C-c"], () => process.exit(0));

  const component = render(<App />, screen);
}

run();
