"use strict";
const functions = require('firebase-functions');
const admin = require("firebase-admin"); 
const gcs = require('@google-cloud/storage')();
const path = require('path');
const os = require('os');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');
const normalize = require('ffmpeg-normalize');
const spawn = require('child-process-promise').spawn;
const adminUid = "3fG1zIUGn1hAf8JkDGd500uNuIi1"
const adminVotePath = `/users/${adminUid}/votes`

admin.initializeApp(functions.config().firebase);

// Makes an ffmpeg command return a promise
function promisifyCommand(command) {
  return new Promise((resolve, reject) => {
    command.on('end', resolve).on('error', reject).run();
  });
}

exports.adminVoteListener = functions.database.ref(adminVotePath).onUpdate(async (change, context) => {
    console.log("adminVoteFunc called")
    const beforeData = change.before.val();
    const beforeKeys = Object.keys(beforeData)
    const afterData = change.after.val();
    const afterKeys = Object.keys(afterData)
    const diffKeys = afterKeys.filter(x => !beforeKeys.includes(x))
    console.log("context...", context)

    if (!diffKeys.length === 1) {
      console.log("Exception happened on adminVoterLister: Too many keys added once!")
      return null;
    }
    const newData = diffKeys[0]
    if (afterData[newData]["vote"] === 5) {
      // projects/projectName ::: /entryNum/wantedKey/clientUid/wavName                      
      const entryTop = afterData[newData]["ref"].replace("votes/", "projects/").split('/').slice(0, 3).join('/')
      const clientUid = afterData[newData]["ref"].split('/')[4]
      // Path under which stores production-ready entry info
      const okPath = adminVotePath.replace('votes', 'done')
      const destPath = [okPath, entryTop].join('/')

      var entryData = {
        u: clientUid
      }
      var destRef = admin.database().ref(destPath)
      var newKey = destRef.push().key
      var updates = {}
      updates[newKey] = entryData
      destRef.update(updates)
      
    } else {
      const voteDir = path.dirname(afterData[newData]["ref"])
      const denoisedPath = afterData[newData]["ref"].replace("votes/", "projects/") + ".wav"
      const filePath = denoisedPath.replace("n_d_", "")
      const destPath = "trash/" + filePath
      const bucket = gcs.bucket("joytan-rec-16ba2.appspot.com")
      const fileName = path.basename(filePath)
      const tempFilePath = path.join(os.tmpdir(), fileName)

      // Remove vote history in order to update the progress bar on Web
      var voteRef = admin.database().ref(voteDir)
      voteRef.remove().then(() => {
        return true;
      }).catch(err => {
        console.log("ERROR: removing voteRef"  + err)
      })

      await bucket.file(filePath).download({destination: tempFilePath});

      await bucket.upload(tempFilePath, {
        destination: destPath,
        metadata: {
          contentType: "audio/x-wav"
        }
      });

      await bucket.file(filePath).delete().then(() => {
        return true
      }).catch(err => {
        console.log("Failed to delete audio @" + filePath + err)
      })
      await bucket.file(denoisedPath).delete().then(() => {
        return true
      }).catch(err => {
        console.log("Failed to delete audio @" + denoisedPath + err)
      })
      fs.unlinkSync(tempFilePath)
    }
    return null;
})

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

  // Static executable of SoX built on Ubuntu 18.04.3 LTS (GNU/Linux 5.0.0-25-generic x86_64)
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
