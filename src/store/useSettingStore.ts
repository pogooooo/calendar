import {persist} from "zustand/middleware";
import {create} from "zustand/react";

interface SettingState {
    theme: string;
    setTheme: (inputTheme: string) => void;
}

const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            theme: 'celestial',

            setTheme: (inputTheme: string) => set({ theme: inputTheme })
        }),
        {
            name: "setting-store"
        }
    )
)

export default useSettingStore;
