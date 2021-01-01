"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mqtt = void 0;
const mqtt_1 = require("mqtt");
const events_1 = require("events");
class Mqtt extends events_1.EventEmitter {
    constructor(config, logger) {
        super();
        this.logger = logger;
        const mqttHost = config['mqtt-host'];
        const options = {
            username: config['mqtt-username'] || '',
            password: config['mqtt-password'] || '',
        };
        this.logger.info(`Connecting to MQTT Host "${mqttHost}"`, options);
        this.client = mqtt_1.connect('mqtt://' + mqttHost, options);
    }
    sendMessage(topic, message) {
        if (!message) {
            throw new Error('Missing Message');
        }
        if (!topic) {
            throw new Error('Missing Topic');
        }
        this.client.publish(topic, message);
        this.logger.debug('mqtt:publish', topic, message);
    }
}
exports.Mqtt = Mqtt;
//# sourceMappingURL=Mqtt.js.map