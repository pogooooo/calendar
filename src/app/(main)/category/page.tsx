import { Metadata } from "next";
import CategoryPage from "@/components/category/CategoryPage";

export const metadata: Metadata = {
    title: "카테고리 관리 | 크로노스",
    description: "할 일 카테고리를 관리하고 멤버를 초대하세요.",
};

export default function Page() {
    return (
        <main style={{ width: '100%', height: '100%' }}>
            <CategoryPage />
        </main>
    );
}