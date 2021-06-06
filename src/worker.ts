import { Channel, connect, Connection, ConsumeMessage } from 'amqplib';
import { EOL } from 'os';
import { BASE_STRING, TASK_QUEUE } from './constants';
import { toSHA256 } from './util';

function solveCryptoPuzzle(difficulty: number): string {
    const nonce: string = Array(difficulty + 1).join('0');

    for (let i = 0; i < Number.MAX_SAFE_INTEGER; i++) {
        const solutionCandidate: string = BASE_STRING + i;

        if (toSHA256(solutionCandidate).startsWith(nonce)) {
            return solutionCandidate;
        }
    }
}

void (async () => {
    const connection: Connection = await connect(process.env.RABBITMQ_URL, {});

    const channel: Channel = await connection.createChannel();

    await channel.assertQueue(TASK_QUEUE, { autoDelete: true });

    await channel.consume(TASK_QUEUE, (message: ConsumeMessage | null) => {
        if (message === null) {
            console.log('Received null message O_o');
        }

        const difficulty: number = JSON.parse(message.content.toString());
        console.log(`Solving crypto puzzle with difficulty of ${difficulty}`);

        const solution: string = solveCryptoPuzzle(difficulty);
        console.log('Solution: ', solution);
        console.log('Hash: ', toSHA256(solution), EOL);

        channel.sendToQueue(message.properties.replyTo, Buffer.from(solution));
    });

    console.log('Listening');
})();
