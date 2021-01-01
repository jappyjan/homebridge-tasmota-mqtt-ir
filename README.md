
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge Tasmota MQTT IR Plugin

## How To:
1. Install Tasmota (with IRSend capabilities on a ESP8266)
2. Note down the last 3 segments of the MAC Address of the ESP without the colons
3. Add the needed configuration in the Homebridge Platforms Configuration

e.g. (not complete, for a full list of available properties look into config.schema.json)
```
{
    "platform": "tasmota-mqtt-ir",
    "mqtt-host": "homebridge.local",
    "devices": [
        {
            "codes": {
                "power": "0xE0E040BF",
                "volume": {
                    "up": "0xE0E0E01F",
                    "down": "0xE0E0D02F"
                },
                "keys": {
                    "ARROW_UP": "0xE0E006F9",
                    "ARROW_DOWN": "0xE0E08679",
                    "ARROW_LEFT": "0xE0E0A659",
                    "ARROW_RIGHT": "0xE0E046B9",
                    "SELECT": "0xE0E016E9",
                    "BACK": "0xE0E01AE5",
                    "EXIT": "0xEBE22BCA",
                    "PLAY_PAUSE": "",
                    "PLAY": "0xE0E0E21D",
                    "PAUSE": "0xE0E052AD",
                    "INFORMATION": "0xE0E0807F"
                }
            },
            "name": "TV",
            "identifier": "F5A960",
            "manufacturer": "Samsung",
            "codeType": "SAMSUNG"
        }
    ]
}
```
