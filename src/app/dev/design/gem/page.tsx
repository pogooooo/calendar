import { notFound } from "next/navigation";
import GemGallery from "./GemGallery";

export default function GemGalleryPage() {
    if (process.env.NODE_ENV !== "development") notFound();
    return <GemGallery />;
}
