const admin = require("firebase-admin");

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace literal \n with actual newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("🔥 Firebase initialized");
  } catch (error) {
    console.error("Firebase init error:", error.message);
  }

  return firebaseApp;
};

const getFirebaseMessaging = () => {
  initFirebase();
  return admin.messaging();
};

module.exports = { initFirebase, getFirebaseMessaging };
