const EventEmitter = require('events')
const btSerial = new (require('bluetooth-serial-port').BluetoothSerialPort)()
const winston = require('winston')

/**
   * An instance of Thermometer that emits events
   * when imporantant changes occur. Create an instance
   * and then call 'scanAndConnect' to go live.
   * 
   * 'connect':
   * If a connection is established, the 'connected'
   * signal will be emitted to listeners. 
   * 
   * 'finishedScan':
   * Emitted when scanning completes
   * 
   * 'disconnect':
   * When the device goes into a disconnected state the
   * 'disconnect' signal will be emitted.
   * 
   * 'data':
   * When measurements are received, the 'data' signal
   * will be emitted.
   * 
   * 'error':
   * Any time an error is encountered, this signal will be
   * emitted.
   */
class Thermometer extends EventEmitter {
  /**
   * Sets the default model
   */
  constructor() {
    super()
    this.model = 'FINGGAL LINK IRSTP3'
  }

  /**
   * Returns the current log level
   */
  get logLevel() {
    return winston.level
  }

  /**
   * Sets the current log level
   * - debug 
   * - info (default)
   * - warning
   * - error
   */
  set logLevel(level) {
    winston.level = level
    winston.debug('Requested log level to to: ' + level)
    winston.debug('Log level is now: ' + winston.level)
  }

  /**
   * Begin scanning for the bluetooth thermometer
   */
  scanAndConnect() {
    // When a device is found...
    btSerial.on('found', (address, name) => {
      winston.debug('Found ' + name)
      winston.debug('address: ' + address)

      // Check if it's the thermometer
      if (name === 'FINGGAL LINK IRSTP3') {
        winston.debug('Identified target device')
        winston.debug('Searching for channels...')

        // if it is, search for open serial ports
        btSerial.findSerialPortChannel(
          address,
          channel => {
            winston.debug('Found channel: ' + channel)
            winston.debug('Attempting to connect...')

            // Once found, connect on that channel
            btSerial.connect(
              address,
              channel,
              () => {
                this.emit('connect')
                winston.debug('Successfully connected!!')

                // Data will start flowing once connected. Data
                // could be a keep alive REQ signal, a disconnect signal,
                // or measurement data.
                btSerial.on('data', buffer => {
                  winston.debug('Received bytes: ' + buffer.byteLength)
                  winston.debug('byte: ' + buffer.toString('hex'))

                  // Regardless of the type of data we always need to send
                  // an ACK to keep the connection alive.
                  const ACK = Buffer.from('AD01', 'hex')
                  btSerial.write(ACK, (error, bytesWritten) => {
                    winston.debug('sent ACK! ')
                    if (error) winston.error(error)
                  })

                  // If the the data is a measurement, snag the temp
                  if (this._bufferContainsMeasurement(buffer)) {
                    const temp = this._extractTemp(buffer)
                    winston.debug('Extracted temp: ' + temp)
                    this.emit('data', temp)
                  }
                })
              },
              // This block is called if we fail to connect
              () => {
                winston.error('Failed to connect!')
                emit('error', new Error('Failed to connect to thermometer!'))
              }
            )
          },
          // This block is called if we can't find an open channel
          () => {
            winston.error('Unable to find any channels.')
            emit('error', new Error('Failed to find any channels'))
          }
        )
      }
    })

    // Pass errors up
    btSerial.on('failure', error => {
      winston.error(error)
      this.emit('error', error)
    })

    // Pass on close events
    btSerial.on('closed', () => {
      winston.debug('Connection closed')
      this.emit('disconnect')
    })

    // Pass on finished events
    btSerial.on('finished', () => {
      winston.debug('Finished scanning')
      this.emit('finishedScan')
    })

    // Now that everything is configured, begin scanning
    btSerial.inquire()
    winston.debug('Beginning scan')
  }

  /**
   * Returns true if the buffer contains a measurement value,
   * and false for anything else, such as REQ keep alives.
   * 
   * The second byte will be hex 03 if the buffer contains
   * measurement data.
   * @param {Buffer} buffer 
   */
  _bufferContainsMeasurement(buffer) {
    return buffer[1] == 3
  }

  /**
   * Extracts the temperature from the data and returns it.
   * 
   * Remove the first 3 bits and last two bits (header, footer)
   * Convert remaining to string, and split at commas. 
   * 
   * Field 0: Model of the thermometer plus lot number
   * Field 1: S/N. Hex value between 001 and FFF
   * Field 2: Hardware/Software versions. Hex values between 00 and FF
   * Field 3: Consecutive data number (not sure what this means)
   * Field 4: Body Temperature in C
   * @param {Buffer} buffer 
   */
  _extractTemp(buffer) {
    const message = buffer.slice(3, -2)
    const fields = message.toString().split(',')
    const temp = parseFloat(fields[4])
    return temp
  }
}

// Export the Thermometer class so it can
// be imported into other files
module.exports = Thermometer
