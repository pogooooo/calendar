import useAuthStore from "@/store/auth/useAuthStore";
import {useRouter} from "next/navigation";
import Header from "@/components/header/Header";

const Main = () => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout);

    const router = useRouter();

    const handleLogout = async () => {
        await logout();

        router.push("/signIn");
    };

    return(
        <div>
            <div>
                <h1>환영합니다, {user?.name || user?.email || "사용자"}님!</h1>
                <button onClick={handleLogout}>로그아웃</button>

                <div style={{background: "#f0f0f0", padding: "10px", borderRadius: "5px"}}>
                    <h3>[Debug Info]</h3>

                    <p><strong>Access Token:</strong></p>
                    <p style={{wordBreak: "break-all", fontSize: "12px", color: "blue"}}>
                        {accessToken || "없음"}
                    </p>

                    <p><strong>User Object:</strong></p>
                    <pre style={{fontSize: "12px", color: "green"}}>
                    {JSON.stringify(user, null, 2)}
                </pre>
                </div>
            </div>
        </div>
    )
}

export default Main
