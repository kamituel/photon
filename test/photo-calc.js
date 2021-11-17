import { expect } from "chai"
import * as PC from '../src/photo-calc.js'


describe('adjustExposureTime()', () => {

  it('1s + 1EV', () => {
    expect(PC.adjustExposureTime(1, 1)).to.equal(2)
  })

  it('10s + 1EV', () => {
    expect(PC.adjustExposureTime(10, 1)).to.equal(20)
  })

  it('1s - 1EV', () => {
    expect(PC.adjustExposureTime(1, -1)).to.equal(0.5)
  })

  it('10s - 1EV', () => {
    expect(PC.adjustExposureTime(10, -1)).to.equal(5)
  })

  it('1s + 5EV', () => {
    expect(PC.adjustExposureTime(1, 5)).to.equal(32)
  })

  it('1s - 8EV', () => {
    expect(PC.adjustExposureTime(1, -8)).to.equal(0.00390625)
  })

  it('1s + 0.5EV', () => {
    expect(PC.adjustExposureTime(1, 0.5)).to.be.closeTo(1.4142, 0.001)
  })

})


describe('deltaEVToSeconds()', () => {

  it('1s + 1EV', () => {
    expect(PC.deltaEVToSeconds(1, 1)).to.equal(1)
  })

  it('10s + 1EV', () => {
    expect(PC.deltaEVToSeconds(10, 1)).to.equal(10)
  })

  it('1s - 1EV', () => {
    expect(PC.deltaEVToSeconds(1, -1)).to.equal(-0.5)
  })

  it('10s - 1EV', () => {
    expect(PC.deltaEVToSeconds(10, -1)).to.equal(-5)
  })

  it('1s + 5EV', () => {
    expect(PC.deltaEVToSeconds(1, 5)).to.equal(31)
  })

  it('1s - 8EV', () => {
    expect(PC.deltaEVToSeconds(1, -8)).to.equal(0.00390625 - 1)
  })

})


describe('timeDifferenceToDeltaEV()', () => {

  it('1s - 2s', () => {
    expect(PC.timeDifferenceToDeltaEV(1, 2)).to.equal(1)
  })

  it('1s - 4s', () => {
    expect(PC.timeDifferenceToDeltaEV(1, 4)).to.equal(2)
  })

  it('4s - 1s', () => {
    expect(PC.timeDifferenceToDeltaEV(4, 1)).to.equal(-2)
  })

})


describe('parseSekonicExposureTime()', () => {

  it('Parses exposure time below 1 second', () => {
    expect(PC.parseSekonicExposureTime('15')).to.equal(1/15)
  })

  it('Parses exposure time above 1 second', () => {
    expect(PC.parseSekonicExposureTime('15s')).to.equal(15)
  })

  it('Parses exposure time above 1 minute', () => {
    expect(PC.parseSekonicExposureTime('15m')).to.equal(15 * 60)
  })

  it('Parses the EV fraction (when below 1 second)', () => {
    let expected = PC.adjustExposureTime(1/15, 0.5)
    expect(PC.parseSekonicExposureTime('15 5')).to.equal(expected)
  })

  it('Parses the EV fraction (when over 1 second)', () => {
    let expected = PC.adjustExposureTime(15, 0.5)
    expect(PC.parseSekonicExposureTime('15s 5')).to.equal(expected)
  })

  it('Parses the EV fraction (when over 1 miunte)', () => {
    let expected = PC.adjustExposureTime(15 * 60, 0.5)
    expect(PC.parseSekonicExposureTime('15m 5')).to.equal(expected)
  })

  it('Parses the decimal fraction (when over 1 second)', () => {
    expect(PC.parseSekonicExposureTime('15.5s')).to.equal(15.5)
  })

  it('Parses the decimal fraction (when over 1 minute)', () => {
    expect(PC.parseSekonicExposureTime('15.5m')).to.equal(60 * 15.5)
  })

  it('Parses the decimal number (for a second)', () => {
    expect(PC.parseSekonicExposureTime('0.3s')).to.equal(0.3)
  })

  it('Parses the decimal number (for a minute)', () => {
    expect(PC.parseSekonicExposureTime('0.3m')).to.equal(18)
  })

})


describe('formatSekonicExposureTime()', () => {

  it('Exposure time below 1 second, without any fraction', () => {
    expect(PC.formatSekonicExposureTime(1/60)).to.equal('60')
  })

  it('Standard exposure time - 1/500 + 0.2 EV', () => {
    expect(PC.formatSekonicExposureTime(0.00174)).to.equal('500 2')
  })

  it('Exposure time over 1 second, without any fraction', () => {
    expect(PC.formatSekonicExposureTime(5)).to.equal('5s')
  })

  it('Exposure time over 1 second, + 0.2 EV', () => {
    expect(PC.formatSekonicExposureTime(5.8)).to.equal('5s 2')
  })

  it('Exposure time over 1 minute, without any fraction', () => {
    expect(PC.formatSekonicExposureTime(120)).to.equal('2m')
  })

  it('Exposure time over 1 minute, + 0.1 EV', () => {
    expect(PC.formatSekonicExposureTime(130)).to.equal('2m 1')
  })

})


describe('depthOfField()', () => {

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f64', () => {
    expect(PC.depthOfField(80, 0.03, 1000, 64)).to.be.closeTo(597.5, 0.1)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f5.6', () => {
    expect(PC.depthOfField(80, 0.03, 1000, 5.6)).to.be.closeTo(48.3, 0.1)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f1.8', () => {
    expect(PC.depthOfField(80, 0.03, 1000, 1.8)).to.be.closeTo(15.5, 0.1)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f1', () => {
    expect(PC.depthOfField(240, 0.005, 10000, 1)).to.be.closeTo(16.9, 0.1)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f64', () => {
    expect(PC.depthOfField(240, 0.005, 10000, 64)).to.be.closeTo(1087.6, 0.1)
  })

})


describe('nearDistanceOfAcceptableSharpness()', () => {

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f64', () => {
    expect(PC.nearDistanceOfAcceptableSharpness(80, 0.03, 1000, 64)).to.be.closeTo(783.69, 0.01)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f5.6', () => {
    expect(PC.nearDistanceOfAcceptableSharpness(80, 0.03, 1000, 5.6)).to.be.closeTo(976.42, 0.01)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f1.8', () => {
    expect(PC.nearDistanceOfAcceptableSharpness(80, 0.03, 1000, 1.8)).to.be.closeTo(992.30, 0.01)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f1', () => {
    expect(PC.nearDistanceOfAcceptableSharpness(240, 0.005, 10000, 1)).to.be.closeTo(9991.5, 0.1)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f64', () => {
    expect(PC.nearDistanceOfAcceptableSharpness(240, 0.005, 10000, 64)).to.be.closeTo(9485.6, 0.1)
  })

})


describe('farDistanceOfAcceptableSharpness()', () => {
  
  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f64', () => {
    expect(PC.farDistanceOfAcceptableSharpness(80, 0.03, 1000, 64)).to.be.closeTo(1381.21, 0.01)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f5.6', () => {
    expect(PC.farDistanceOfAcceptableSharpness(80, 0.03, 1000, 5.6)).to.be.closeTo(1024.75, 0.01)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f1.8', () => {
    expect(PC.farDistanceOfAcceptableSharpness(80, 0.03, 1000, 1.8)).to.be.closeTo(1007.82, 0.01)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f1', () => {
    expect(PC.farDistanceOfAcceptableSharpness(240, 0.005, 10000, 1)).to.be.closeTo(10008.5, 0.1)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f64', () => {
    expect(PC.farDistanceOfAcceptableSharpness(240, 0.005, 10000, 64)).to.be.closeTo(10573.3, 0.1)
  })

})