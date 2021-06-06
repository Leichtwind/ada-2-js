import { createHash } from 'crypto';

export function toSHA256(data: string): string {
    return createHash('sha256').update(data).digest('hex')
}
