import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
    uid: string;
    username: string;
    email: string;
    createdAt: Date;
}

// 注册新用户
export async function registerUser(
    email: string,
    password: string,
    username: string
): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 更新用户显示名称
    await updateProfile(user, { displayName: username });

    // 在 Firestore 中创建用户文档
    const userProfile: UserProfile = {
        uid: user.uid,
        username,
        email: user.email!,
        createdAt: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);

    return userProfile;
}

// 登录
export async function loginUser(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

// 登出
export async function logoutUser(): Promise<void> {
    await signOut(auth);
}

// 获取用户资料
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
}

// 监听认证状态变化
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}
