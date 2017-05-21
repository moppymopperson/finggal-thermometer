const expect = require('chai').expect
const sinon = require('sinon')
const Thermometer = require('../index')

const sut = new Thermometer()
const testData =
  'ad031e49525354503330322c3030352c4830305330322c3030312c33352e380d0a'

describe('Thermometer', () => {
  it('has the correct default model', () => {
    expect(sut.model).to.equal('FINGGAL LINK IRSTP3')
  })

  it('the log level is set to info by default', () => {
    expect(sut.logLevel).to.equal('info')
  })

  it('updates the log level properly', () => {
    sut.logLevel = 'error'
    expect(sut.logLevel).to.equal('error')
  })

  it('has a method for scanning and connecting', () => {
    expect(sut.scanAndConnect).to.not.be.null
  })

  describe('has a method to check if the data contains a temperature', () => {
    it('that exists', () => {
      expect(sut._bufferContainsMeasurement).to.not.be.null
    })

    it('returns true for valid data', () => {
      const buffer = Buffer.from(testData, 'hex')
      const result = sut._bufferContainsMeasurement(buffer)
      expect(result).to.be.true
    })

    it('returns false for invalid data', () => {
      const buffer = Buffer.from('ad01abdf01df23')
      const result = sut._bufferContainsMeasurement(buffer)
      expect(result).to.be.false
    })
  })

  describe('has a method for extracting temp from valid data', () => {
    it('that exists', () => {
      expect(sut._extractTemp).to.not.be.null
    })

    it('extracts the correct temperature', () => {
      const buffer = Buffer.from(testData, 'hex')
      const temp = sut._extractTemp(buffer)
      expect(temp).to.equal(35.8)
    })
  })

  describe('it is an event emitter', () => {
    it('has an emit function', () => {
      expect(sut.emit).to.not.be.null
    })

    it('invokes a callback', () => {
      const spy = sinon.spy()
      sut.on('foo', spy)
      sut.emit('foo')
      sinon.assert.calledOnce(spy)
    })

    it('passes arguments to callbacks', () => {
      const spy = sinon.spy()
      sut.on('bar', spy)
      sut.emit('bar', 1, 2, 3)
      sinon.assert.calledOnce(spy)
      sinon.assert.calledWith(spy, 1, 2, 3)
    })
  })
})
