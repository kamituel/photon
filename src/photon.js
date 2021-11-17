
/*
  Given exposure time in seconds and a EV delta,
  returns a new exposure time with the EV change
  applied.
*/
export function adjustExposureTime (exposureTime, deltaEV) {
  return exposureTime * Math.pow(2, deltaEV)
}


/*
  Given exposure time in seconds and a EV delta,
  returns a change (in seconds) how the exposure time
  should change.
*/
export function deltaEVToSeconds (exposureTime, deltaEV) {
  return adjustExposureTime(exposureTime, deltaEV) - exposureTime
}


/*
  Given two exposure times in seconds, returns
  the difference between those times in EV.
*/
export function timeDifferenceToDeltaEV (exposureTime1, exposureTime2) {
  return Math.log2(exposureTime2 / exposureTime1)
}


/*
  Given a string, as displayed by the Sekonic light meter,
  returns the exposure time (in seconds).
*/
export function parseSekonicExposureTime (exposureTimeString) {
  let value = exposureTimeString.trim()

  let overMinute = value.match(/(\d+(?:\.\d)?)m\s*(\d)?/)
  let overSecond = value.match(/(\d+(?:\.\d)?)s\s*(\d)?/)
  let underSecond = value.match(/(\d+)(?:\s+(\d))?/)

  if (overMinute) {
    let [_, exposureTime, decimalEV] = overMinute
    exposureTime = Number(exposureTime) * 60
    decimalEV = decimalEV
                  ? (Number(decimalEV) / 10)
                  : 0
    return adjustExposureTime(exposureTime, decimalEV)
  } else if (overSecond) {
    let [_, exposureTime, decimalEV] = overSecond
    exposureTime = Number(exposureTime)
    decimalEV = decimalEV
                  ? (Number(decimalEV) / 10)
                  : 0
    return adjustExposureTime(exposureTime, decimalEV)
  } else if (underSecond) {
    let [_, exposureTime, decimalEV] = underSecond
    exposureTime = 1 / Number(exposureTime)
    decimalEV = decimalEV
                  ? (Number(decimalEV) / 10)
                  : 0
    return adjustExposureTime(exposureTime, decimalEV)
  } else {
    return null
  }
}


/*
  Takes an exposure time expressed in seconds, and returns
  a string representing this time that looks like it could've
  been displayed by the Sekonic light meter.

  E.g. 1/60th of a second will be displayed as '60',
       and 60 seconds as '60s'.

  Supports fractions too. E.g. '500 3' means '1/500th of a second
  plus 0.3 EV'.
*/
export function formatSekonicExposureTime (exposureTimeSec) {
  let standardShutterSpeeds = [
    8000, 4000, 2000, 1000, 500, 400, 250, 125, 60, 30, 15, 8, 4, 2
  ]

  let getDeltaEVSuffix = (displayedExposureTime, realExposureTime) => {
    let evDelta = timeDifferenceToDeltaEV(displayedExposureTime, realExposureTime)
    evDelta = evDelta.toPrecision(1) * 10

    if (evDelta === 0) {
      return ''
    } else {
      return ' ' + evDelta
    }
  }

  if (exposureTimeSec < 1) {
    for (let speed of standardShutterSpeeds) {
      if (exposureTimeSec <= 1 / speed) {
        let suffix = getDeltaEVSuffix(exposureTimeSec, 1 / speed)
        return `${speed}${suffix}`
      }
    }
  } else if (exposureTimeSec < 60) {
    let exposureTimeRounded = Math.floor(exposureTimeSec)
    let suffix = getDeltaEVSuffix(exposureTimeRounded, exposureTimeSec)
    return `${exposureTimeRounded}s${suffix}`
  } else if (exposureTimeSec >= 60) {
    let exposureTimeRounded = Math.floor(exposureTimeSec / 60)
    let suffix = getDeltaEVSuffix(exposureTimeRounded, exposureTimeSec / 60)
    return `${exposureTimeRounded}m${suffix}`
  }
}


/*
  Calculates the near distance of acceptable sharpness (in millimeters) given:

    - lens focal length [mm]
    - circle of confusion [mm]
    - focusing distance [mm]
    - lens f-stop, e.g. 5.6
*/
export function nearDistanceOfAcceptableSharpness (focalLength, circleOfConfusion, focusingDistance, fStop) {
  let a = fStop
  let c = circleOfConfusion
  let d = focusingDistance
  let f = focalLength

  return d * f * f / (f * f + (a * c * (d - f)) )
}


/*
  Calculates the far distance of acceptable sharpness (in millimeters) given:

    - lens focal length [mm]
    - circle of confusion [mm]
    - focusing distance [mm]
    - lens f-stop, e.g. 5.6
*/
export function farDistanceOfAcceptableSharpness (focalLength, circleOfConfusion, focusingDistance, fStop) {
  let a = fStop
  let c = circleOfConfusion
  let d = focusingDistance
  let f = focalLength

  return d * f * f / (f * f - (a * c * (d - f)) )
}


/*
  Calculates depth of field (in millimeters) given:

    - lens focal length [mm]
    - circle of confusion [mm]
    - focusing distance [mm]
    - lens f-stop, e.g. 5.6
*/
export function depthOfField (focalLength, circleOfConfusion, focusingDistance, fStop) {
  return (
    farDistanceOfAcceptableSharpness(focalLength, circleOfConfusion, focusingDistance, fStop)
    - nearDistanceOfAcceptableSharpness(focalLength, circleOfConfusion, focusingDistance, fStop)
  )
}


/*
  Given a type of aperture scale, returns a list of f-stops
  between f1 and f90.

  Scale is one of:
    - full-stop
    - half-of-a-stop
    - third-of-a-stop
*/
export function fStops (scale) {
  let allFStops = {
    'full-stop': [1.0, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32, 45, 64, 90],
    'half-of-a-stop': [1.0, 1.2, 1.4, 1.7, 2, 2.4, 2.8, 3.3, 4, 4.8, 5.6, 6.7, 8, 9.5, 11, 13, 16, 19, 22, 27, 32, 38, 45, 54, 64, 76, 90],
    'third-of-a-stop': [1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5.0, 5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32, 36, 40, 45, 51, 57, 64, 72, 80, 90]
  }

  let fStops = allFStops[scale]

  if (!fStops) {
    throw Error(`fStops invoked with scale '${scale}' which is not supported.`)
  }

  return fStops
}


/*
  Given a type of aperture scale, returns a first wider
  f-stop, if it exists. Otherwise returns null.

  See fStops().
*/
export function nextWiderFStop (fStop, scale) {
  if (!fStop) {
    return null
  }

  let stops = fStops(scale)
  let idx = stops.indexOf(fStop)

  if (idx === -1 || idx === 0) {
    return null
  } else {
    return stops[idx - 1]
  }
}


/*
  Given a type of aperture scale, returns a first narrower
  f-stop, if it exists. Otherwise returns null.

  See fStops().
*/
export function nextNarrowerFStop (fStop, scale) {
  if (!fStop) {
    return null
  }

  let stops = fStops(scale)
  let idx = stops.indexOf(fStop)

  if (idx === -1 || idx === stops.length - 1) {
    return null
  } else {
    return stops[idx + 1]
  }
}
