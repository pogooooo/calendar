import { usePickTheme } from "@/styles/themed";
import { GemAnniversaryIcon } from "@/assets/gem/GemIcons";

const Star = () => <>✦</>;
export default function HomeAnniversaryMark() {
    const View = usePickTheme({ celestial: Star, maple: Star, ocean: Star, gem: GemAnniversaryIcon });
    return <View />;
}
