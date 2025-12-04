importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAzUpxTaGLN3uFCLtwimtjpAtODz_7GftE",
    authDomain: "fitspotter-a9f7b.firebaseapp.com",
    projectId: "fitspotter-a9f7b",
    storageBucket: "fitspotter-a9f7b.firebasestorage.app",
    messagingSenderId: "733811785720",
    appId: "1:733811785720:web:570aadb2db9ca9f2f1e00d",
    measurementId: "G-68QJEZDM9S"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
