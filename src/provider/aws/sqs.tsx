import AWS from "aws-sdk";
import React, { Component } from "react";
import { DefaultTableStyle } from "../../styles/table";
AWS.config.update({ region: "us-east-1" });

type Props = {};
type State = {
    queues: { url: string; name: string; messages: number | string }[];
};

export default class SQS extends Component<Props, State> {
    public static $ = new AWS.SQS({ apiVersion: "2012-11-05" });

    constructor(props: any) {
        super(props);

        this.state = {
            queues: [],
        } as any;
    }

    async componentDidMount() {
        await this.fetchQueues();
        await this.loadQueueCounts();
    }

    public async fetchQueues() {
        const queues = await SQS.$.listQueues().promise();
        const queuesMapped =
            queues.QueueUrls?.map((url) => ({
                url,
                name: url.match(/\/([^\/]+)$/)?.pop() as string,
                messages: "Loading...",
            })) || [];
        this.setState({
            queues: queuesMapped,
        });
    }

    buildTable(
        queueList: {
            url: string;
            name: string;
            messages: number | string;
        }[] = []
    ) {
        const rows = queueList.map((queue) => [
            queue.name,
            String(queue.messages),
        ]);
        return [["Queue", "Message Count"], ...rows];
    }

    async loadQueueCounts() {
        for (const { name, url } of this.state.queues) {
            SQS.$.getQueueAttributes({
                QueueUrl: url,
                AttributeNames: ["ApproximateNumberOfMessages"],
            })
                .promise()
                .then((res) => {
                    const messages = Number(
                        res.Attributes?.ApproximateNumberOfMessages || "0"
                    );
                    this.setState({
                        queues: this.state.queues.map((queue) =>
                            queue.name === name ? { ...queue, messages } : queue
                        ),
                    });
                });
        }
    }

    render() {
        return (
            <blessed-listtable
                width="90%"
                height="90%"
                top="center"
                left="center"
                rows={this.buildTable(this.state.queues)}
                border={{ type: "line" }}
                mouse
                keys
                style={DefaultTableStyle}
            />
        );
    }
}
