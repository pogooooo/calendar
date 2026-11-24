"use client";

import { useId, useState, type CSSProperties } from "react";
import { Check } from "lucide-react";
import styles from "./GemGalleryControls.module.css";

export default function GemGalleryControls() {
    const rangeId = useId();
    const [ornament, setOrnament] = useState(false);
    const [intensity, setIntensity] = useState(60);
    const [completed, setCompleted] = useState(true);

    return <div className={styles.controls}>
        <article className={styles.specimen}>
            <h3>토글 레버</h3>
            <div className={styles.stage}>
                <button type="button" role="switch" aria-label="장식 사용" aria-checked={ornament}
                    className={styles.lever} onClick={() => setOrnament(value => !value)}>
                    <span className={styles.leverRail} aria-hidden="true">
                        <span className={styles.leverKnob} />
                    </span>
                </button>
            </div>
            <p>장식 사용 <span aria-hidden="true">{ornament ? "켜짐" : "꺼짐"}</span></p>
        </article>

        <article className={styles.specimen}>
            <h3>슬라이더</h3>
            <div className={styles.stage}>
                <input id={rangeId} className={styles.range} type="range" min={0} max={100} step={5}
                    value={intensity} aria-valuetext={`${intensity}%`}
                    style={{ "--meter": `${intensity}%` } as CSSProperties}
                    onChange={event => setIntensity(event.currentTarget.valueAsNumber)} />
            </div>
            <p><label htmlFor={rangeId}>장식 투명도</label> <span aria-hidden="true">{intensity}%</span></p>
        </article>

        <article className={styles.specimen}>
            <h3>체크박스</h3>
            <div className={styles.stage}>
                <label className={styles.check}>
                    <input type="checkbox" checked={completed} aria-label="일정 완료"
                        onChange={event => setCompleted(event.currentTarget.checked)} />
                    <span className={styles.checkStone} aria-hidden="true"><Check size={15} strokeWidth={1.75} /></span>
                </label>
            </div>
            <p>일정 상태 <span aria-hidden="true">{completed ? "완료" : "진행 중"}</span></p>
        </article>
    </div>;
}
