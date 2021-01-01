import { PlatformAccessory } from 'homebridge';
import { Platform } from './Platform';
export interface TvConfig {
    'name': string;
    'manufacturer': string;
    'model': string;
    'serial': string;
    'identifier': string;
    'codeType': string;
    'codes': {
        'power': string;
        'volume': {
            'up': string;
            'down': string;
            'mute': string;
        };
        'keys': {
            'REWIND': string;
            'FAST_FORWARD': string;
            'NEXT_TRACK': string;
            'PREVIOUS_TRACK': string;
            'ARROW_UP': string;
            'ARROW_DOWN': string;
            'ARROW_LEFT': string;
            'ARROW_RIGHT': string;
            'SELECT': string;
            'BACK': string;
            'EXIT': string;
            'PLAY_PAUSE': string;
            'PLAY': string;
            'PAUSE': string;
            'INFORMATION': string;
        };
    };
}
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export declare class Accessory {
    private readonly platform;
    private readonly accessory;
    private readonly televisionService;
    private speakerService?;
    private configuredRemoteKeys;
    private readonly deviceConfig;
    private readonly id;
    private hackToPreventPowerOffWhenPressingKeyActive;
    private state;
    constructor(platform: Platform, accessory: PlatformAccessory);
    private sendIRCode;
    private configureMetaCharacteristics;
    private onSetActiveIdentifier;
    private configureRemoteKeys;
    private onRemoteKeyPress;
    private configureVolumeKeys;
    private setMute;
    private getMute;
    private setVolume;
    private setPower;
    private getPower;
}
//# sourceMappingURL=Accessory.d.ts.map