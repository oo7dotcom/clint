import AWS from "aws-sdk";
AWS.config.update({ region: "us-east-1" });

export default class SQS {
    public static $ = new AWS.SQS({ apiVersion: "2012-11-05" });

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
}
