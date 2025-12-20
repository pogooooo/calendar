import {persist} from "zustand/middleware";
import {create} from "zustand/react";

const useSettingStore = create(
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
