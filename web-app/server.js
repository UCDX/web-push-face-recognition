require('dotenv').config()
const express = require('express');
const webpush = require('web-push');
const bodyparser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('.data/db.json');
const db = low(adapter);
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: process.env.VAPID_SUBJECT
};

db.defaults({
  subscriptions: []
}).write();

/**
 * @param {Object} notif Object with
 * - title: String
 * - body: String
 */
function sendNotifications(subscriptions, notif = {}) {
  // Create the notification content.
  const notification = JSON.stringify({
    title: notif.title || "Hello, Notifications!" ,
    options: {
      body: notif.body || `ID: ${Math.floor(Math.random() * 100)}`
    }
  });
  // Customize how the push service should attempt to deliver the push message.
  // And provide authentication information.
  const options = {
    TTL: 10000,
    vapidDetails: vapidDetails
  };
  // Send a push message to each client specified in the subscriptions array.
  subscriptions.forEach(subscription => {
    const endpoint = subscription.endpoint;
    const id = endpoint.substr((endpoint.length - 8), endpoint.length);
    webpush.sendNotification(subscription, notification, options)
      .then(result => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Result: ${result.statusCode}`);
      })
      .catch(error => {
        console.log(`Endpoint ID: ${id}`);
        console.log(`Error: ${error} `);
      });
  });
}

const app = express();
app.use(bodyparser.json());
app.use(express.static('public'));
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));

// ------------------- Start of middlewares-------------------

// Save temporary image in tmp folder with name "image" plus extension (png).
saveTmpImageMidd = (request, response, next) => {
  console.log('Saving photo in tmp folder...');
  const img = request.body.photo;
  const regex = /^data:.+\/(.+);base64,(.*)$/;

  const matches = img.match(regex);
  const ext = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64'); 

  tmp_dir = 'tmp'

  // Check if tmp folder exists, if not, create it.
  if (!fs.existsSync(tmp_dir)) {
    fs.mkdirSync(tmp_dir);
  }
  const filename = 'image.' + ext
  const filepath = path.join(tmp_dir, filename)
  fs.writeFileSync(filepath, buffer); 

  next()
}

faceRecognitionMidd = (request, response, next) => {
  console.log('Face recognition...');
  request.faceRecognition = {
    faceIdentified: false,
    person: 'John Doe'
  }

  next()
}

deleteTmpImagesMidd = (request, response, next) => {
  console.log('Deleting tmp images...');
  // Get all files in tmp directory
  const files = fs.readdirSync('tmp')
  // Delete all files in tmp directory.
  files.forEach(file => {
    fs.unlinkSync(path.join('tmp', file))
  })

  next()
}

// ------------------- End of middlewares-------------------

app.post('/add-subscription', (request, response) => {
  console.log('/add-subscription');
  //console.log(request.body);
  console.log(`Subscribing ${request.body.endpoint}`);
  db.get('subscriptions')
    .push(request.body)
    .write();
  response.sendStatus(200);
});

app.post('/remove-subscription', (request, response) => {
  console.log('/remove-subscription');
  //console.log(request.body);
  console.log(`Unsubscribing ${request.body.endpoint}`);
  db.get('subscriptions')
    .remove({endpoint: request.body.endpoint})
    .write();
  response.sendStatus(200);
});

app.post('/notify-me', (request, response) => {
  console.log('/notify-me');
  //console.log(request.body);
  console.log(`Notifying ${request.body.endpoint}`);
  const subscription = 
      db.get('subscriptions').find({endpoint: request.body.endpoint}).value();
  sendNotifications([subscription]);
  response.sendStatus(200);
});

app.post('/notify-all', (request, response) => {
  console.log('/notify-all');
  //response.sendStatus(200);
  console.log('Notifying all subscribers');
  const subscriptions =
      db.get('subscriptions').cloneDeep().value();
  if (subscriptions.length > 0) {
    sendNotifications(subscriptions);
    response.sendStatus(200);
  } else {
    response.sendStatus(409);
  }
});

app.post(
  '/person-picture', 
  saveTmpImageMidd, 
  faceRecognitionMidd, 
  deleteTmpImagesMidd, 
  (request, response) => {
    console.log('/person-picture');
    
    if (request.faceRecognition.faceIdentified) {
      const subscriptions = db.get('subscriptions').cloneDeep().value();
      if (subscriptions.length > 0) {
        const notif = {
          title: 'Reconocimiento facial',
          body: `Se ha detectado a ${request.faceRecognition.person}`
        }
        sendNotifications(subscriptions, notif);
        return response.sendStatus(200);
      } else {
        return response.sendStatus(409);
      }
    }

    response.sendStatus(403);
})

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/face-recognition', (request, response) => {
  response.sendFile(__dirname + '/views/face_recognition.html');
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`-------------------------------`);
  console.log(`Server running on port: ${listener.address().port}`);
  console.log(`-------------------------------`);
});
