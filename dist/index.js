"use strict";
const Platform_1 = require("./Platform");
const settings_1 = require("./settings");
module.exports = (api) => {
    api.registerPlatform('homebridge-' + settings_1.PLATFORM_NAME, settings_1.PLATFORM_NAME, Platform_1.Platform);
};
//# sourceMappingURL=index.js.map