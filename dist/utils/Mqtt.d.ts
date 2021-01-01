/// <reference types="node" />
import { EventEmitter } from 'events';
import { Logger } from 'homebridge';
export declare class Mqtt extends EventEmitter {
    private readonly logger;
    private readonly client;
    constructor(config: any, logger: Logger);
    sendMessage(topic: any, message: any): void;
}
//# sourceMappingURL=Mqtt.d.ts.map