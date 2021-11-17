import { expect } from "chai"
import * as P from '../src/photon.js'


describe('adjustExposureTime()', () => {

  it('1s + 1EV', () => {
    expect(P.adjustExposureTime(1, 1)).to.equal(2)
  })

  it('10s + 1EV', () => {
    expect(P.adjustExposureTime(10, 1)).to.equal(20)
  })

  it('1s - 1EV', () => {
    expect(P.adjustExposureTime(1, -1)).to.equal(0.5)
  })

  it('10s - 1EV', () => {
    expect(P.adjustExposureTime(10, -1)).to.equal(5)
  })

  it('1s + 5EV', () => {
    expect(P.adjustExposureTime(1, 5)).to.equal(32)
  })

  it('1s - 8EV', () => {
    expect(P.adjustExposureTime(1, -8)).to.equal(0.00390625)
  })

  it('1s + 0.5EV', () => {
    expect(P.adjustExposureTime(1, 0.5)).to.be.closeTo(1.4142, 0.001)
  })

})


describe('deltaEVToSeconds()', () => {

  it('1s + 1EV', () => {
    expect(P.deltaEVToSeconds(1, 1)).to.equal(1)
  })

  it('10s + 1EV', () => {
    expect(P.deltaEVToSeconds(10, 1)).to.equal(10)
  })

  it('1s - 1EV', () => {
    expect(P.deltaEVToSeconds(1, -1)).to.equal(-0.5)
  })

  it('10s - 1EV', () => {
    expect(P.deltaEVToSeconds(10, -1)).to.equal(-5)
  })

  it('1s + 5EV', () => {
    expect(P.deltaEVToSeconds(1, 5)).to.equal(31)
  })

  it('1s - 8EV', () => {
    expect(P.deltaEVToSeconds(1, -8)).to.equal(0.00390625 - 1)
  })

})


describe('timeDifferenceToDeltaEV()', () => {

  it('1s - 2s', () => {
    expect(P.timeDifferenceToDeltaEV(1, 2)).to.equal(1)
  })

  it('1s - 4s', () => {
    expect(P.timeDifferenceToDeltaEV(1, 4)).to.equal(2)
  })

  it('4s - 1s', () => {
    expect(P.timeDifferenceToDeltaEV(4, 1)).to.equal(-2)
  })

})


describe('parseSekonicExposureTime()', () => {

  it('Parses exposure time below 1 second', () => {
    expect(P.parseSekonicExposureTime('15')).to.equal(1/15)
  })

  it('Parses exposure time above 1 second', () => {
    expect(P.parseSekonicExposureTime('15s')).to.equal(15)
  })

  it('Parses exposure time above 1 minute', () => {
    expect(P.parseSekonicExposureTime('15m')).to.equal(15 * 60)
  })

  it('Parses the EV fraction (when below 1 second)', () => {
    let expected = P.adjustExposureTime(1/15, 0.5)
    expect(P.parseSekonicExposureTime('15 5')).to.equal(expected)
  })

  it('Parses the EV fraction (when over 1 second)', () => {
    let expected = P.adjustExposureTime(15, 0.5)
    expect(P.parseSekonicExposureTime('15s 5')).to.equal(expected)
  })

  it('Parses the EV fraction (when over 1 miunte)', () => {
    let expected = P.adjustExposureTime(15 * 60, 0.5)
    expect(P.parseSekonicExposureTime('15m 5')).to.equal(expected)
  })

  it('Parses the decimal fraction (when over 1 second)', () => {
    expect(P.parseSekonicExposureTime('15.5s')).to.equal(15.5)
  })

  it('Parses the decimal fraction (when over 1 minute)', () => {
    expect(P.parseSekonicExposureTime('15.5m')).to.equal(60 * 15.5)
  })

  it('Parses the decimal number (for a second)', () => {
    expect(P.parseSekonicExposureTime('0.3s')).to.equal(0.3)
  })

  it('Parses the decimal number (for a minute)', () => {
    expect(P.parseSekonicExposureTime('0.3m')).to.equal(18)
  })

})


describe('formatSekonicExposureTime()', () => {

  it('Exposure time below 1 second, without any fraction', () => {
    expect(P.formatSekonicExposureTime(1/60)).to.equal('60')
  })

  it('Standard exposure time - 1/500 + 0.2 EV', () => {
    expect(P.formatSekonicExposureTime(0.00174)).to.equal('500 2')
  })

  it('Exposure time over 1 second, without any fraction', () => {
    expect(P.formatSekonicExposureTime(5)).to.equal('5s')
  })

  it('Exposure time over 1 second, + 0.2 EV', () => {
    expect(P.formatSekonicExposureTime(5.8)).to.equal('5s 2')
  })

  it('Exposure time over 1 minute, without any fraction', () => {
    expect(P.formatSekonicExposureTime(120)).to.equal('2m')
  })

  it('Exposure time over 1 minute, + 0.1 EV', () => {
    expect(P.formatSekonicExposureTime(130)).to.equal('2m 1')
  })

})


describe('depthOfField()', () => {

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f64', () => {
    expect(P.depthOfField(80, 0.03, 1000, 64)).to.be.closeTo(597.5, 0.1)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f5.6', () => {
    expect(P.depthOfField(80, 0.03, 1000, 5.6)).to.be.closeTo(48.3, 0.1)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f1.8', () => {
    expect(P.depthOfField(80, 0.03, 1000, 1.8)).to.be.closeTo(15.5, 0.1)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f1', () => {
    expect(P.depthOfField(240, 0.005, 10000, 1)).to.be.closeTo(16.9, 0.1)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f64', () => {
    expect(P.depthOfField(240, 0.005, 10000, 64)).to.be.closeTo(1087.6, 0.1)
  })

})


describe('nearDistanceOfAcceptableSharpness()', () => {

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f64', () => {
    expect(P.nearDistanceOfAcceptableSharpness(80, 0.03, 1000, 64)).to.be.closeTo(783.69, 0.01)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f5.6', () => {
    expect(P.nearDistanceOfAcceptableSharpness(80, 0.03, 1000, 5.6)).to.be.closeTo(976.42, 0.01)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f1.8', () => {
    expect(P.nearDistanceOfAcceptableSharpness(80, 0.03, 1000, 1.8)).to.be.closeTo(992.30, 0.01)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f1', () => {
    expect(P.nearDistanceOfAcceptableSharpness(240, 0.005, 10000, 1)).to.be.closeTo(9991.5, 0.1)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f64', () => {
    expect(P.nearDistanceOfAcceptableSharpness(240, 0.005, 10000, 64)).to.be.closeTo(9485.6, 0.1)
  })

})


describe('farDistanceOfAcceptableSharpness()', () => {
  
  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f64', () => {
    expect(P.farDistanceOfAcceptableSharpness(80, 0.03, 1000, 64)).to.be.closeTo(1381.21, 0.01)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f5.6', () => {
    expect(P.farDistanceOfAcceptableSharpness(80, 0.03, 1000, 5.6)).to.be.closeTo(1024.75, 0.01)
  })

  it('80 mm lens, CoC 0.03 mm, subject 1 meter away, f1.8', () => {
    expect(P.farDistanceOfAcceptableSharpness(80, 0.03, 1000, 1.8)).to.be.closeTo(1007.82, 0.01)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f1', () => {
    expect(P.farDistanceOfAcceptableSharpness(240, 0.005, 10000, 1)).to.be.closeTo(10008.5, 0.1)
  })

  it('240 mm lens, CoC 0.005 mm, subject 10 meters away, f64', () => {
    expect(P.farDistanceOfAcceptableSharpness(240, 0.005, 10000, 64)).to.be.closeTo(10573.3, 0.1)
  })

})


describe('fStops()', () => {

  it('Returns a correct list of 1 EV f-stops', () => {
    let fStops = [1.0, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32, 45, 64, 90]
    expect(P.fStops('full-stop')).to.eql(fStops)
  })

  it('Returns a correct list of 1/2 EV f-stops', () => {
    let fStops = [
      1.0, 1.2, 1.4, 1.7, 2, 2.4, 2.8, 3.3, 4, 4.8, 5.6, 6.7, 8,
      9.5, 11, 13, 16, 19, 22, 27, 32, 38, 45, 54, 64, 76, 90
    ]
    expect(P.fStops('half-of-a-stop')).to.eql(fStops)
  })

  it('Returns a correct list of 1/3 EV f-stops', () => {
    let fStops = [
      1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5,
      4, 4.5, 5.0, 5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16, 18,
      20, 22, 25, 29, 32, 36, 40, 45, 51, 57, 64, 72, 80, 90
    ]
    expect(P.fStops('third-of-a-stop')).to.eql(fStops)
  })

})


describe('nextWiderFStop()', () => {

  it('Works at 1 EV scale', () => {
    expect(P.nextWiderFStop(45, 'full-stop')).to.equal(32)
  })

  it('Works at 1/2 EV scale', () => {
    expect(P.nextWiderFStop(45, 'half-of-a-stop')).to.equal(38)
  })

  it('Works at 1/3 EV scale', () => {
    expect(P.nextWiderFStop(45, 'third-of-a-stop')).to.equal(40)
  })

  it(`Works when there's no wider f-stop`, () =>
    expect(P.nextWiderFStop(1, 'full-stop')).to.be.null
  )

  it('When f-stop given is not in the scale, returns undefined', () => {
    expect(P.nextWiderFStop(46, 'full-stop')).to.be.null
  })

})


describe('nextNarrowerFStop()', () => {

  it('Works at 1 EV scale', () => {
    expect(P.nextNarrowerFStop(45, 'full-stop')).to.equal(64)
  })

  it('Works at 1/2 EV scale', () => {
    expect(P.nextNarrowerFStop(45, 'half-of-a-stop')).to.equal(54)
  })

  it('Works at 1/3 EV scale', () => {
    expect(P.nextNarrowerFStop(45, 'third-of-a-stop')).to.equal(51)
  })

  it(`Works when there's no narrower f-stop`, () =>
    expect(P.nextNarrowerFStop(90, 'full-stop')).to.be.null
  )

  it('When f-stop given is not in the scale, returns undefined', () => {
    expect(P.nextNarrowerFStop(46, 'full-stop')).to.be.null
  })

})
