# Finggal Link Bluetooth Thermometer
This module provides a simple bluetooth API for Finggal bluetooth thermometers.

> Current Support is only for the IRSTP3 model
> See [bluetooth-serial-port](https://www.npmjs.com/package/bluetooth-serial-port) for platform specific install dependencies. Testing has only been performed on Debian (Raspian), but it should work on all OS's that bluetooth-serial-port supports.

## Useage
import the package and instantiage an object.

```javascript
const Thermometer = require('./thermometer')
const thermometer = new Thermometer()
```

Register for events, and begin scanning.
```javascript
thermometer.on('connect', () => {
  console.log('Connected!')
})

thermometer.on('disconnect', () => {
  console.log('Disconnected')
})

thermometer.on('finishedScan', () => {
  console.log('Completed scan')
})

thermometer.on('error', error => {
  console.log(error)
})

thermometer.on('data', temp => {
  console.log('Temp: ' + temp + '˚C')
})

// Don't forget this!
thermometer.scanAndConnect()
```
