"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
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
    .onWrite((event) => __awaiter(this, void 0, void 0, function* () {
    const data = event.data;
    const realData = data.data();
    const userId = realData.userId;
    // const subscriber = data.subscriberId
    // Notification content
    const payload = {
        notification: {
            title: 'New user',
            body: `${userId} is following your content!`,
            icon: 'https://goo.gl/Fz9nrQ'
        }
    };
    // ref to the device collection for the user
    const db = admin.firestore();
    const devicesRef = db.collection('devices').where('userId', '==', userId);
    // get the user's tokens and send notifications
    const devices = yield devicesRef.get();
    const tokens = [];
    // send a notification to each device token
    devices.forEach(result => {
        const token = result.data().token;
        tokens.push(token);
    });
    return admin.messaging().sendToDevice(tokens, payload);
}));
//# sourceMappingURL=index.js.map