import { GemNavIcon } from "@/assets/gem/GemIcons";
import type { EmptyArtKind } from "../EmptyArt";
import { Art } from "./GemEmptyArt.styles";

const icons = { todos: "calendar", projects: "project", challenges: "challenge", anniversaries: "anniversary" } as const;
export default function GemEmptyArt({ kind }: { kind: EmptyArtKind }) {
    return <Art data-empty-art={kind} aria-hidden="true"><GemNavIcon name={icons[kind]} size={34}/></Art>;
}
