import {connect as connectToMqttServer, MqttClient} from 'mqtt';
import {EventEmitter} from 'events';
import {Logger} from 'homebridge';

export class Mqtt extends EventEmitter {
  private readonly client: MqttClient;

  constructor(
    config,
    private readonly logger: Logger,
  ) {
    super();

    const options = {
      username: config['mqtt-username'] || '',
      password: config['mqtt-password'] || '',
    };
    this.client = connectToMqttServer('mqtt://' + config['mqtt-host'], options);
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
