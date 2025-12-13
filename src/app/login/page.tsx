"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const { login, register, user, isLoading: authLoading } = useAuth();
    const [isRegister, setIsRegister] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    // 如果已登录，重定向到首页
    React.useEffect(() => {
        if (user && !authLoading) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error("请输入邮箱和密码");
            return;
        }

        if (isRegister && !username.trim()) {
            toast.error("请输入用户名");
            return;
        }

        setIsLoading(true);

        try {
            if (isRegister) {
                const result = await register(email, password, username);
                if (result.success) {
                    toast.success("注册成功");
                    router.push("/");
                } else {
                    toast.error(result.error || "注册失败");
                }
            } else {
                const result = await login(email, password);
                if (result.success) {
                    toast.success("登录成功");
                    router.push("/");
                } else {
                    toast.error(result.error || "登录失败");
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            toast.error(isRegister ? "注册失败" : "登录失败");
        }

        setIsLoading(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <p className="text-muted-foreground">加载中...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isRegister ? "注册" : "登录"}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {isRegister ? "创建新账号" : "登录以访问你的卡组"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">用户名</label>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="输入用户名"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">邮箱</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="输入邮箱"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">密码</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="输入密码（至少6位）"
                            disabled={isLoading}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (isRegister ? "注册中..." : "登录中...") : (isRegister ? "注册" : "登录")}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? "已有账号？去登录" : "没有账号？去注册"}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                        返回首页
                    </Link>
                </div>
            </div>
        </div>
    );
}
