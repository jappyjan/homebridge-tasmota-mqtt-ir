"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accessory = void 0;
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
class Accessory {
    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.configuredRemoteKeys = [];
        this.hackToPreventPowerOffWhenPressingKeyActive = false;
        this.state = {
            mute: false,
            isPlaying: true,
        };
        this.deviceConfig = accessory.context.device;
        this.id = this.deviceConfig.name + this.deviceConfig.identifier;
        accessory.category = 31 /* TELEVISION */;
        this.televisionService =
            this.accessory.getService(this.id) ||
                this.accessory.addService(this.platform.Service.Television, this.deviceConfig.name, this.id);
        this.configureMetaCharacteristics();
        this.configureRemoteKeys();
        if (this.deviceConfig.codes.volume.up && this.deviceConfig.codes.volume.down) {
            this.configureVolumeKeys();
        }
    }
    sendIRCode(code) {
        const command = `cmnd/tasmota_${this.deviceConfig.identifier.toUpperCase()}/IRsend`;
        this.platform.mqtt.sendMessage(command, JSON.stringify({
            Protocol: this.deviceConfig.codeType,
            Bits: 32,
            Data: code,
        }));
    }
    configureMetaCharacteristics() {
        this.televisionService.getCharacteristic(this.platform.Characteristic.Active)
            .on('set', this.setPower.bind(this))
            .on('get', this.getPower.bind(this));
        this.televisionService
            .getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
            .on('set', this.onSetActiveIdentifier.bind(this));
        this.televisionService.updateCharacteristic(this.platform.Characteristic.Active, false);
        this.televisionService
            .setCharacteristic(this.platform.Characteristic.ActiveIdentifier, 1);
        this.televisionService.setCharacteristic(this.platform.Characteristic.SleepDiscoveryMode, this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);
        this.televisionService.setCharacteristic(this.platform.Characteristic.ConfiguredName, this.deviceConfig.name);
        this.televisionService.setCharacteristic(this.platform.Characteristic.Name, this.deviceConfig.name);
        const accessoryInformationService = this.accessory.getService(this.platform.Service.AccessoryInformation);
        accessoryInformationService
            .setCharacteristic(this.platform.Characteristic.Manufacturer, this.deviceConfig.manufacturer || 'Default-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, this.deviceConfig.model || 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.deviceConfig.serial || 'Default-Serial');
    }
    onSetActiveIdentifier(value, callback) {
        this.platform.log.debug('set Active Identifier => setNewValue: ' + value);
        callback(null);
    }
    configureRemoteKeys() {
        this.televisionService.getCharacteristic(this.platform.Characteristic.RemoteKey)
            .on('set', this.onRemoteKeyPress.bind(this));
        const configuredRemoteKeyStrings = this.deviceConfig.codes.keys ? Object.keys(this.deviceConfig.codes.keys) : [];
        configuredRemoteKeyStrings.forEach(key => {
            this.platform.log.debug('Configuring Remote-Key: ' + key);
            this.configuredRemoteKeys.push(this.platform.Characteristic.RemoteKey[key]);
        });
    }
    onRemoteKeyPress(value, callback) {
        this.hackToPreventPowerOffWhenPressingKeyActive = true;
        setTimeout(() => this.hackToPreventPowerOffWhenPressingKeyActive = false, 3000);
        this.platform.log.debug('Remote Key Pressed ' + value);
        if (!this.deviceConfig.codes.keys ||
            !this.configuredRemoteKeys.find((item) => item === value)) {
            this.platform.log.error(`Remote Key ${value} not configured in this.configuredRemoteKeys`);
            this.platform.log.debug(JSON.stringify(this.configuredRemoteKeys, null, 4));
            callback(new Error(`Remote-Key "${value}" not configured`));
            return;
        }
        let irCode = '';
        Object.keys(this.platform.Characteristic.RemoteKey).forEach((keyOfRemoteKeyObject) => {
            if (this.platform.Characteristic.RemoteKey[keyOfRemoteKeyObject] === value) {
                this.platform.log.debug(`Remote-Key ${value} maps to ${keyOfRemoteKeyObject}`);
                irCode = this.deviceConfig.codes.keys[keyOfRemoteKeyObject];
                if (!irCode && keyOfRemoteKeyObject === 'PLAY_PAUSE') {
                    const playState = this.state.isPlaying ? 'PAUSE' : 'PLAY';
                    irCode = this.deviceConfig.codes.keys[playState];
                }
            }
        });
        if (!irCode) {
            this.platform.log.debug(JSON.stringify(Object.keys(this.platform.Characteristic.RemoteKey), null, 4));
            this.platform.log.error(`Remote Key ${value} not configured`);
            callback(new Error(`Remote-Key ${value} not configured`));
            return;
        }
        this.sendIRCode(irCode);
        this.state.isPlaying = !this.state.isPlaying;
        callback(null);
    }
    configureVolumeKeys() {
        this.platform.log.debug('Adding speaker service');
        const speakerId = this.id + '--speaker';
        this.speakerService =
            this.accessory.getService(speakerId) ||
                this.accessory.addService(this.platform.Service.TelevisionSpeaker, this.deviceConfig.name + ' - Speaker', speakerId);
        // set the volume control type
        this.speakerService
            .setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE)
            .setCharacteristic(this.platform.Characteristic.VolumeControlType, this.platform.Characteristic.VolumeControlType.ABSOLUTE);
        if (this.deviceConfig.codes.volume.mute) {
            this.speakerService
                .getCharacteristic(this.platform.Characteristic.Mute)
                .on('set', this.setMute.bind(this))
                .on('get', this.getMute.bind(this));
        }
        this.speakerService
            .getCharacteristic(this.platform.Characteristic.VolumeSelector)
            .on('set', this.setVolume.bind(this));
        // Link the service
        this.televisionService.addLinkedService(this.speakerService);
    }
    setMute(value, callback) {
        this.platform.log.debug('Set Mute: ', value);
        this.sendIRCode(this.deviceConfig.codes.volume.mute);
        this.state.mute = !this.state.mute;
        callback(null);
    }
    getMute(callback) {
        this.platform.log.debug('Get Mute');
        callback(null, this.state.mute);
    }
    setVolume(value, callback) {
        this.platform.log.debug('Set Volume: ', value);
        let irCode = this.deviceConfig.codes.volume.up;
        if (value === this.platform.Characteristic.VolumeSelector.DECREMENT) {
            irCode = this.deviceConfig.codes.volume.down;
        }
        this.sendIRCode(irCode);
        this.platform.log.debug('Sending code: ' + irCode);
        callback(null);
    }
    setPower(value, callback) {
        this.platform.log.debug('Set Power: ', value);
        if (!this.hackToPreventPowerOffWhenPressingKeyActive) {
            this.sendIRCode(this.deviceConfig.codes.power);
        }
        else {
            this.platform.log.debug('setPower disabled to prevent bug that turns TV off when pressing the information button');
        }
        callback(null);
    }
    getPower(callback) {
        this.platform.log.debug('Get Power');
        callback(null, true);
    }
}
exports.Accessory = Accessory;
//# sourceMappingURL=Accessory.js.map