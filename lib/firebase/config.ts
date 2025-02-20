// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDy6wsQBOEVuw3tj0DEFMdgmv6FutBR51Q',
  authDomain: 'qtdict-9f889.firebaseapp.com',
  projectId: 'qtdict-9f889',
  storageBucket: 'qtdict-9f889.firebasestorage.app',
  messagingSenderId: '575379367822',
  appId: '1:575379367822:web:585f2f3ce0133c6ddbe6df',
  measurementId: 'G-E65E8NX6WY',
};

let firebase_app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default firebase_app;
