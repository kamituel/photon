
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

