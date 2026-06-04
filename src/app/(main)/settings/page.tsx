import { Metadata } from "next";
import SettingsPage from "@/components/settings/SettingsPage";

export const metadata: Metadata = {
    title: "설정 | 크로노스",
    description: "앱의 외관과 동작 방식을 조정하세요.",
};

export default function Page() {
    return (
        <main style={{ width: "100%", height: "100%" }}>
            <SettingsPage />
        </main>
    );
}
