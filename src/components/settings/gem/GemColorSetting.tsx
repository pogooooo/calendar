import { useId, useState, type FormEvent } from "react";
import useSettingStore from "@/store/useSettingStore";
import { DEFAULT_STONE, gemHex, gemRgb, parseGemHex } from "@/features/gem/color";
import { ColorBox } from "./GemSettings.styles";

const STONES = [
    { value: DEFAULT_STONE, ko: "자수정", en: "Amethyst" },
    { value: "#1E6193", ko: "사파이어", en: "Sapphire" },
    { value: "#16795B", ko: "에메랄드", en: "Emerald" },
    { value: "#94384D", ko: "가넷", en: "Garnet" },
    { value: "#B4784E", ko: "황수정", en: "Citrine" },
] as const;
const CHANNELS = ["R", "G", "B"] as const;
type Channel = (typeof CHANNELS)[number];

export default function GemColorSetting({ english }: { english: boolean }) {
    const color = useSettingStore(state => state.gemColor);
    const setColor = useSettingStore(state => state.setGemColor);
    const id = useId();
    const [hexDraft, setHexDraft] = useState<string | null>(null);
    const [rgbDraft, setRgbDraft] = useState<Partial<Record<Channel, string>>>({});
    const [invalid, setInvalid] = useState<"hex" | "rgb" | null>(null);
    const rgb = gemRgb(color);
    const label = english ? "Gem color" : "보석 색상";
    const applyLabel = english ? "Apply" : "적용";
    const hexError = invalid === "hex";
    const rgbError = invalid === "rgb";
    const rgbValues = CHANNELS.map((channel, index) => rgbDraft[channel] ?? String(rgb[index]));

    function apply(next: string) {
        setColor(next);
        setHexDraft(null);
        setRgbDraft({});
        setInvalid(null);
    }

    function submitHex(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const next = parseGemHex(hexDraft ?? color);
        if (next) apply(next);
        else setInvalid("hex");
    }

    function submitRgb(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (rgbValues.every(value => /^\d{1,3}$/.test(value) && Number(value) <= 255)) {
            apply(gemHex(rgbValues.map(Number)));
        } else {
            setInvalid("rgb");
        }
    }

    return <ColorBox>
        <legend>{label}</legend>
        <div className="gem-color-layout">
            <div className="gem-color-controls">
                <div className="gem-swatches" role="group" aria-label={english ? "Gemstone presets" : "추천 보석 색상"}>
                    {STONES.map(stone => <button key={stone.value} type="button" aria-pressed={color === stone.value}
                        onClick={() => apply(stone.value)}>
                        <i aria-hidden="true" style={{ backgroundColor: stone.value }} />
                        {english ? stone.en : stone.ko}
                    </button>)}
                </div>
                <div className="gem-color-current">
                    <label>
                        <input type="color" value={color} onChange={event => apply(event.currentTarget.value.toUpperCase())} />
                        {english ? "Choose a color" : "직접 고르기"}
                    </label>
                    <output aria-live="polite" aria-atomic="true">{color}</output>
                    <button type="button" disabled={color === DEFAULT_STONE} onClick={() => apply(DEFAULT_STONE)}>
                        {english ? "Reset" : "기본색"}
                    </button>
                </div>
            </div>
            <div className="gem-color-sample" aria-hidden="true">
                <span>{english ? "Calendar preview" : "캘린더 미리보기"}</span>
                <strong>16</strong>
                <span className="gem-color-event">{english ? "Sample event" : "일정 예시"}</span>
            </div>
        </div>
        <details className="gem-color-exact">
            <summary>{english ? "Enter an exact color · HEX / RGB" : "코드로 지정 · HEX / RGB"}</summary>
            <div className="gem-color-forms">
                <form onSubmit={submitHex}>
                    <div className="gem-color-entry">
                        <label htmlFor={`${id}-hex`}>HEX</label>
                        <input id={`${id}-hex`} type="text" value={hexDraft ?? color} maxLength={7}
                            autoComplete="off" spellCheck={false} aria-invalid={hexError}
                            aria-describedby={hexError ? `${id}-hex-error` : undefined}
                            onChange={event => {
                                setHexDraft(event.currentTarget.value);
                                if (hexError) setInvalid(null);
                            }} />
                        <button type="submit">{applyLabel}</button>
                    </div>
                    {hexError && <p id={`${id}-hex-error`} role="alert">
                        {english ? "Enter 3 or 6 hex digits, for example #1E6193." : "#1E6193처럼 3자리 또는 6자리 HEX 코드를 입력해 주세요."}
                    </p>}
                </form>
                <form onSubmit={submitRgb}>
                    <div className="gem-color-entry gem-color-entry-rgb">
                        {CHANNELS.map((channel, index) => <label key={channel}>
                            {channel}
                            <input type="text" inputMode="numeric" maxLength={3} value={rgbValues[index]}
                                autoComplete="off" aria-invalid={rgbError}
                                aria-describedby={rgbError ? `${id}-rgb-error` : undefined}
                                onChange={event => {
                                    const value = event.currentTarget.value;
                                    setRgbDraft(previous => ({ ...previous, [channel]: value }));
                                    if (rgbError) setInvalid(null);
                                }} />
                        </label>)}
                        <button type="submit">{applyLabel}</button>
                    </div>
                    {rgbError && <p id={`${id}-rgb-error`} role="alert">
                        {english ? "Enter a whole number from 0 to 255 for each channel." : "R, G, B에 각각 0~255 사이의 정수를 입력해 주세요."}
                    </p>}
                </form>
            </div>
        </details>
        <p className="gem-color-note">{english
            ? "Saved on this device. The stone tone changes while highlights and metal trim keep their colors."
            : "이 기기에 저장돼요. 보석의 색조가 바뀌어도 반사광과 금속 장식의 색은 그대로예요."}</p>
    </ColorBox>;
}
