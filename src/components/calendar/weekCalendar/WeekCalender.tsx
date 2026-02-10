import Arrow from "@/assets/celestial/Arrow";
import Twinkle from "@/assets/celestial/Twinkle";
import {useTheme} from "styled-components";

const WeekCalendar = () => {
    const theme = useTheme();

    return(
        <div>
            <Arrow width={100} height={50} stroke={theme.colors.primary} isRight={false}></Arrow>
            <Twinkle width={50} height={100} stroke={theme.colors.primary} />
        </div>
    )
}

export default WeekCalendar
