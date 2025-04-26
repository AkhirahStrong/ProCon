// main.js (for Vite bundling)

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  createUserWithEmailAndPassword,
  GoogleAuthProvider
} from 'firebase/auth';

export {
  initializeApp,
  getAuth,
  signInWithPopup,
  createUserWithEmailAndPassword,
  GoogleAuthProvider
};

