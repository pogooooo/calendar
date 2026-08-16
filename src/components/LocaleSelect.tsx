"use client";

import styled from "styled-components";
import useSettingStore from "@/store/useSettingStore";
import type { Locale } from "@/i18n/types";
import { useT } from "@/i18n/useT";
import CelestialSelect from "@/components/input/select/CelestialSelect";

export default function LocaleSelect({ size = "md" }: { size?: "sm" | "md" }) {
    const locale = useSettingStore((s) => s.locale);
    const setLocale = useSettingStore((s) => s.setLocale);
    const t = useT();

    return (
        <Sized $size={size}>
            <CelestialSelect
                size={size}
                value={locale}
                onChange={(v) => setLocale(v as Locale)}
                options={[
                    { value: "ko", label: t.system.korean },
                    { value: "en", label: t.system.english },
                ]}
                ariaLabel={t.system.language}
            />
        </Sized>
    );
}

const Sized = styled.div<{ $size: "sm" | "md" }>`
    width: ${p => (p.$size === "sm" ? "112px" : "132px")};
`;
