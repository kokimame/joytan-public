"use strict";
const functions = require('firebase-functions');
const gcs = require('@google-cloud/storage')();
const path = require('path');
const os = require('os');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');
const normalize = require('ffmpeg-normalize');
const spawn = require('child-process-promise').spawn;


// Makes an ffmpeg command return a promise
function promisifyCommand(command) {
  return new Promise((resolve, reject) => {
    command.on('end', resolve).on('error', reject).run();
  });
}

exports.denoiseAudio = functions.storage.object().onFinalize(async (object) => {
  const fileBucket = object.bucket;
  const filePath = object.name;
  const fileName = path.basename(filePath);
  const contentType = object.contentType;

  if (!contentType.startsWith('audio')) {
    console.log("This is not an audio")
    return null;
  }
  if (fileName.startsWith('n_') || fileName.startsWith('d_')) {
    console.log("This file is already processed");
    return null;
  }

  const soxPath = [__dirname, 'sox'].join('/');
  const bucket = gcs.bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const noiseProfPath = path.join(os.tmpdir(), "noise.prof");
  const denoisedTempFileName = "d_" + fileName;
  const denoisedTempFilePath = path.join(os.tmpdir(), denoisedTempFileName);
  const normedTempFileName = "n_" + denoisedTempFileName;
  const normedTempFilePath = path.join(os.tmpdir(), normedTempFileName);
  const normedStorageFilePath = path.join(path.dirname(filePath), normedTempFileName);

  await bucket.file(filePath).download({destination: tempFilePath});
  console.log("Audio uploaded locally to ", tempFilePath);

  await spawn(soxPath, [
    tempFilePath, "-n", "noiseprof", noiseProfPath
  ], {capture : ['stdout', 'stderr']})
  .catch(err => {
    console.log(err)
  })
  console.log("Noise profile created at", noiseProfPath)


  await spawn(soxPath, [
    tempFilePath, denoisedTempFilePath, "noisered", noiseProfPath, "0.1"
  ], {capture : ['stdout', 'stderr']})
  .catch(err => {
    console.log(err)
  })
  console.log("Denoised audio created at", denoisedTempFilePath)

  await spawn(soxPath, [
    "--norm=-8", denoisedTempFilePath, normedTempFilePath
  ], {capture : ['stdout', 'stderr']})
  .catch(err => {
    console.log(err)
  });
  console.log('Normed audio created at', normedTempFilePath);

  await bucket.upload(normedTempFilePath, {
    destination: normedStorageFilePath,
    metadata: {
      contentType: "audio/x-wav"
    }
  });
  console.log('Normed audio uploaded to ', normedStorageFilePath);

  // Once the audio has been uploaded delete the local file to free up disk space
  fs.unlinkSync(tempFilePath);
  fs.unlinkSync(normedTempFilePath);

  return console.log('Temporary files removed.', normedTempFilePath)
});
