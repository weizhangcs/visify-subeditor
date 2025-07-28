function resampling(pcm, option) {
  var scale = Math.ceil(option.sampleRate / option.reSampleRate);
  var length = Math.ceil(pcm.length / scale);
  var sample = new Float32Array(length);

  for (var i = 0, j = 0; i < pcm.length; i += scale, j += 1) {
    sample[j] = Math.abs(pcm[i]);
  }

  return sample;
}

function binarization(sample, option) {
  var result = new Float32Array(sample.length);

  var sampleArr = Array.from(sample.slice(0, option.denoiseRadius));
  var sampleSum = sampleArr
    .map(function (item) {
      return item < option.threshold ? 0 : 1;
    })
    .reduce(function (result, item) {
      return result + item;
    }, 0);

  for (var j = 0; j < sample.length; j++) {
    if (sampleArr.length === option.denoiseRadius * 2 + 1) {
      sampleSum -= sampleArr.shift() || 0;
    }

    var add = sample[j + option.denoiseRadius];
    if (add !== undefined) {
      add = add < option.threshold ? 0 : 1;
      sampleArr.push(add);
      sampleSum += add;
    }

    result[j] = sampleSum > sampleArr.length * option.denoiseProportion ? 1 : 0;
  }

  return result;
}

function getTimestamp(sample, option) {
  var timestamp = [];
  var startTime = null;
  var endTime = null;

  for (var i = 0; i < sample.length; i++) {
    var item = sample[i];

    if (item === 1) {
      var time = (i + 1) / option.reSampleRate;

      if (sample[i - 1] === 0 || i === 0) {
        startTime = time;
        endTime = null;
      }

      if (sample[i + 1] === 0 || i === sample.length - 1) {
        endTime = time;
      }
    }

    if (startTime !== null && endTime !== null) {
      var lastTimestamp = timestamp[timestamp.length - 1];
      if (
        lastTimestamp &&
        startTime - lastTimestamp[1] <= option.minDuration &&
        endTime - lastTimestamp[0] <= option.maxDuration
      ) {
        lastTimestamp[1] = endTime;
      } else {
        var duration = endTime - startTime;
        if (duration >= option.minDuration && duration <= option.maxDuration) {
          timestamp.push([startTime, endTime]);
        }
      }
      startTime = null;
      endTime = null;
    }
  }

  return timestamp;
}

function pcmToTimestamp(sample, option) {
  var sample2 = binarization(sample, option);
  return getTimestamp(sample2, option);
}

function getDuration(timestamp) {
  return timestamp.reduce(function (duration, item) {
    return duration + (item[1] - item[0]);
  }, 0);
}

onmessage = function onmessage(event) {
  var data = event.data;
  var result = [];
  var denoiseRadiuses = [55, 110, 220, 440];
  var thresholds = [0.0125, 0.025, 0.05, 0.1, 0.2];

  var option = {
    sampleRate: 44100,
    reSampleRate: 441,
    denoiseRadius: 110,
    denoiseProportion: 0.5,
    threshold: 0.0125,
    minDuration: 0.2,
    maxDuration: 10,
  };

  var sample1 = resampling(data, option);

  for (var j = 0; j < denoiseRadiuses.length; j++) {
    for (var i = 0; i < thresholds.length; i++) {
      option.denoiseRadius = denoiseRadiuses[j];
      option.threshold = thresholds[i];
      var timestamp = pcmToTimestamp(sample1.slice(), option);
      if (getDuration(timestamp) > getDuration(result)) {
        result = timestamp;
      }
    }
  }

  postMessage(result);
};
