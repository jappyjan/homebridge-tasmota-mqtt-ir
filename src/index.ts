import {API} from 'homebridge';
import {Plugin} from './HttpIrTvPlugin';
import {PLATFORM_NAME} from './settings';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerPlatform(
    'homebridge-' + PLATFORM_NAME,
    PLATFORM_NAME,
    Plugin,
  );
};
