# hue-discover

Discover locally available Hue bridges

```
npm install hue-discover
```

## Usage

```js
const discover = require('hue-discover');
discover().then(bridges => {
    for (let bridge of bridges) {
        console.log(bridge);
    }
});
```

**Example output**

```json
{
    "id": "ecb5fafffe25c6b9",
    "internalipaddress": "192.168.1.249",
    "deviceType": "urn:schemas-upnp-org:device:Basic:1",
    "friendlyName": "Philips hue (192.168.1.249)",
    "manufacturer": "Signify",
    "manufacturerURL": "http://www.philips-hue.com",
    "modelDescription": "Philips hue Personal Wireless Lighting",
    "modelName": "Philips hue bridge 2015",
    "modelNumber": "BSB002",
    "modelURL": "http://www.philips-hue.com",
    "serialNumber": "xxxxxxxxxxxxx",
    "UDN": "uuid:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
    "presentationURL": "index.html"
}
```

> **NB!** hue-discover sets up listeners for mdns and ssdp which are not closed automatically so application process will not be closed once your other code is finished.

## License

**MIT**
