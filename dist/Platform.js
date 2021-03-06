"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = void 0;
const settings_1 = require("./settings");
const Accessory_1 = require("./Accessory");
const Mqtt_1 = require("./utils/Mqtt");
class Platform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        // this is used to track restored cached accessories
        this.accessories = [];
        this.log.debug('Finished initializing platform:', this.config.name);
        this.mqtt = new Mqtt_1.Mqtt(config, log);
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback');
            // run the method to discover / register your devices as accessories
            this.discoverDevices();
        });
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this.accessories.push(accessory);
    }
    /**
     * This is an example method showing how to register discovered accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    discoverDevices() {
        // EXAMPLE ONLY
        // A real plugin you would discover accessories from the local network, cloud services
        // or a user-defined array in the platform config.
        const devices = this.config.devices;
        // loop over the discovered devices and register each one if it has not already been registered
        for (const device of devices) {
            // generate a unique id for the accessory this should be generated from
            // something globally unique, but constant, for example, the device serial
            // number or MAC address
            const uuid = this.api.hap.uuid.generate(`@jappyjan--tasmota-mqtt-ir_${device.identifier}_${device.name}`);
            // see if an accessory with the same uuid has already been registered and restored from
            // the cached devices we stored in the `configureAccessory` method above
            const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
            if (existingAccessory && !device) {
                // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
                // remove platform accessories when no longer present
                this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [existingAccessory]);
                this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
                return;
            }
            if (existingAccessory) {
                this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
                // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
                // existingAccessory.context.device = device;
                // this.api.updatePlatformAccessories([existingAccessory]);
                // create the accessory handler for the restored accessory
                // this is imported from `platformAccessory.ts`
                new Accessory_1.Accessory(this, existingAccessory);
                // update accessory cache with any changes to the accessory details and information
                this.api.updatePlatformAccessories([existingAccessory]);
                return;
            }
            // the accessory does not yet exist, so we need to create it
            this.log.info('Adding new accessory:', device.name);
            // create a new accessory
            const accessory = new this.api.platformAccessory(device.name, uuid, 31 /* TELEVISION */);
            // store a copy of the device object in the `accessory.context`
            // the `context` property can be used to store any data about the accessory you may need
            accessory.context.device = device;
            // create the accessory handler for the newly create accessory
            // this is imported from `platformAccessory.ts`
            new Accessory_1.Accessory(this, accessory);
            // link the accessory to your platform
            this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
        }
    }
}
exports.Platform = Platform;
//# sourceMappingURL=Platform.js.map