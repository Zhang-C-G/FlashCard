import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyCi0elO5xmlLlJIO5R6JrJt2aPTmqDQsSA",
    authDomain: "flashcard-app-4134e.firebaseapp.com",
    projectId: "flashcard-app-4134e",
    storageBucket: "flashcard-app-4134e.firebasestorage.app",
    messagingSenderId: "425930514",
    appId: "1:425930514:web:4d8026cb52cada14460dcb",
    measurementId: "G-W1BSGVG7M4",
};

// 初始化 Firebase（避免重复初始化）
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// 导出 Firebase 服务
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
