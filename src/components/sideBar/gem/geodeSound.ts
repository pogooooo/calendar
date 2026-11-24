let context: AudioContext | undefined;
let lastStrike = -Infinity;

const partials = [[1180, .16, .22], [1775, .058, .17], [2671, .031, .13], [3907, .016, .08]];

export function playGeodeSound(higher: boolean) {
    if (typeof AudioContext === "undefined" || performance.now() - lastStrike < 95) return;
    try {
        const audio = context ??= new AudioContext();
        lastStrike = performance.now();
        const strike = () => {
            if (audio.state !== "running") return;
            const start = audio.currentTime + .004;
            for (const [frequency, volume, tail] of partials) {
                const tone = audio.createOscillator();
                const gain = audio.createGain();
                tone.frequency.value = frequency * (higher ? 1.122 : 1);
                gain.gain.setValueAtTime(.0001, start);
                gain.gain.exponentialRampToValueAtTime(volume * .18, start + .007);
                gain.gain.exponentialRampToValueAtTime(.0001, start + tail);
                tone.connect(gain).connect(audio.destination);
                tone.onended = () => { tone.disconnect(); gain.disconnect(); };
                tone.start(start);
                tone.stop(start + tail + .016);
            }
        };
        if (audio.state === "running") strike();
        else void audio.resume().then(strike).catch(() => {});
    } catch {
        // Sidebar navigation still works if the host denies audio.
    }
}
