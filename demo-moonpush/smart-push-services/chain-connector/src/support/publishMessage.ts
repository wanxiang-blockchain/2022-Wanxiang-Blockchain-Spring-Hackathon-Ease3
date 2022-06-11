export class PublishMessage {
    data: object[];
    key: string;
    chain?: string = '';
}
export enum PublishMessageKey {
    BLOCK = 'block',
    EXTRINSIC = 'extrinsic'
}