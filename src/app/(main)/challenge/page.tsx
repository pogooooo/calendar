import { Metadata } from "next";
import ChallengePage from "@/components/challenge/ChallengePage";

export const metadata: Metadata = {
    title: "챌린지 관리 | 크로노스",
    description: "반복적인 목표를 설정하고 스티커를 모아보세요.",
};

export default function Page() {
    return (
        <main style={{ width: '100%', height: '100%' }}>
            <ChallengePage />
        </main>
    );
}