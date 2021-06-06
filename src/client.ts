import { Channel, connect, Connection, ConsumeMessage } from 'amqplib';
import { EOL } from 'os';
import { SOLUTION_QUEUE, TASK_QUEUE } from './constants';
import { toSHA256 } from './util';

void (async () => {
    const [, appName, difficultyString] = process.argv;

    if (!difficultyString) {
        console.log(
            `Call application ${appName} with arguments [n]`, EOL,
            'Example:', EOL,
            '7 -- Application will try to solve crypto puzzle SHA256 with nonce that will generate 7 trailing 0 of the hashed message', EOL,
            '8 -- Application will try to solve crypto puzzle SHA256 with nonce that will generate 8 trailing 0 of the hashed message',
        );

        process.exit(1);
    }

    const difficulty: number = parseInt(difficultyString, 10);

    if (isNaN(difficulty)) {
        console.log('Incorrect arguments passed. Argument should be a number.', EOL, `Call application ${appName} for help message`);

        process.exit(1);
    }

    const connection: Connection = await connect(process.env.RABBITMQ_URL);

    const channel: Channel = await connection.createChannel();

    await channel.assertQueue(TASK_QUEUE, { autoDelete: true });
    await channel.assertQueue(SOLUTION_QUEUE, { autoDelete: true });

    await channel.consume(SOLUTION_QUEUE, (message: ConsumeMessage | null) => {
        if (message === null) {
            console.log('Received null message O_o');
        }

        const solution: string = message.content.toString();

        console.log('Solution: ', solution);
        console.log('Hash: ', toSHA256(solution));

        void (async () => {
            await channel.close();
            await connection.close();

            console.log("I'm done");

            process.exit(0);
        })();
    });

    channel.sendToQueue(TASK_QUEUE, Buffer.from(JSON.stringify(difficulty)), { replyTo: SOLUTION_QUEUE });
    console.log('Solution requested')
})();
