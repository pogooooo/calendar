import Arrow from "@/assets/celestial/Arrow";
import {useTheme} from "styled-components";

const WeekCalendar = () => {
    const theme = useTheme();

    return(
        <div>
            <Arrow width={100} height={50} stroke={theme.colors.primary} isRight={false}></Arrow>
        </div>
    )
}

export default WeekCalendar
