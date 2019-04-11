import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
admin.initializeApp();


// exports.createUser = functions.firestore
//   .document('devices/{userId}')
//   .onCreate(event => {
//       // Get an object representing the document
//       // e.g. {'name': 'Marie', 'age': 66}
//       const eventTemp = event.data;
//
//       // access a particular field as you would any JS property
//       const user = eventTemp.data();
//
//       console.log("User id is:", user.userId);
//       // perform desired operations ...
//     });


exports.newActivity = functions.firestore
    .document('users/../babies/{firstName}')
    .onWrite(async (event) => {

    const data = event.data;

    const realData = data.data();

    const userId = realData.userId
    // const subscriber = data.subscriberId

    // Notification content
    const payload = {
      notification: {
          title: 'New user',
          body: `${userId} is following your content!`,
          icon: 'https://goo.gl/Fz9nrQ'
      }
    }

    // ref to the device collection for the user
    const db = admin.firestore()
    const devicesRef = db.collection('devices').where('userId', '==', userId)


    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    const tokens = [];

    // send a notification to each device token
    devices.forEach(result => {
      const token = result.data().token;

      tokens.push( token )
    })

    return admin.messaging().sendToDevice(tokens, payload)

});
