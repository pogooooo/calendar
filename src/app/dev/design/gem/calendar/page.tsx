import { notFound } from "next/navigation";
import GemCalendarPreview from "./GemCalendarPreview";

export default function GemCalendarPreviewPage() {
    if (process.env.NODE_ENV !== "development") notFound();
    return <GemCalendarPreview />;
}
