"use client";

import * as React from "react";
import { User, AuthError } from "firebase/auth";
import { onAuthChange, logoutUser, loginUser, registerUser, getUserProfile, type UserProfile } from "@/lib/services/auth-service";

interface AuthResult {
    success: boolean;
    error?: string;
}

interface AuthContextType {
    user: UserProfile | null;
    firebaseUser: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<AuthResult>;
    register: (email: string, password: string, username: string) => Promise<AuthResult>;
    logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Firebase 错误码转中文
function getErrorMessage(error: AuthError): string {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "该邮箱已被注册";
        case "auth/invalid-email":
            return "邮箱格式不正确";
        case "auth/weak-password":
            return "密码太弱，至少需要6个字符";
        case "auth/user-not-found":
            return "用户不存在";
        case "auth/wrong-password":
            return "密码错误";
        case "auth/too-many-requests":
            return "请求过于频繁，请稍后再试";
        case "auth/network-request-failed":
            return "网络错误，请检查网络连接";
        case "auth/invalid-credential":
            return "邮箱或密码错误";
        default:
            return error.message || "操作失败";
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<UserProfile | null>(null);
    const [firebaseUser, setFirebaseUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    // 监听 Firebase 认证状态
    React.useEffect(() => {
        const unsubscribe = onAuthChange(async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                // 获取用户资料
                const profile = await getUserProfile(fbUser.uid);
                if (profile) {
                    setUser(profile);
                } else {
                    // 如果没有用户资料，使用 Firebase 用户信息
                    setUser({
                        uid: fbUser.uid,
                        username: fbUser.displayName || "用户",
                        email: fbUser.email || "",
                        createdAt: new Date(),
                    });
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<AuthResult> => {
        try {
            await loginUser(email, password);
            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            const authError = error as AuthError;
            return { success: false, error: getErrorMessage(authError) };
        }
    };

    const register = async (email: string, password: string, username: string): Promise<AuthResult> => {
        try {
            await registerUser(email, password, username);
            return { success: true };
        } catch (error) {
            console.error("Register error:", error);
            const authError = error as AuthError;
            return { success: false, error: getErrorMessage(authError) };
        }
    };

    const logout = async (): Promise<void> => {
        await logoutUser();
    };

    return (
        <AuthContext.Provider value={{ user, firebaseUser, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

