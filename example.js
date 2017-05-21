const Thermometer = require('./thermometer')

const thermometer = new Thermometer()

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

thermometer.scanAndConnect()
