"use client";

import * as React from "react";
import ChallengeView from "./ChallengeView";

import { useAuthFetch } from "@/hooks/useAuthFetch";
import useChallengeStore from "@/store/useChallengeStore";
import useCategoryStore from "@/store/useCategoryStore";
import { ChallengeData } from "@/components/modal/challengeModal/ChallengeModal";
import { localDateKey } from "@/lib/dateKey";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { challengeExpired, completionKey, completionTargetFor, slotIndexOn } from "@/lib/challengeDays";
import { useDialog } from "@/components/dialog/DialogProvider";
import { useT } from "@/i18n/useT";

export default function ChallengePage() {
    const authFetch = useAuthFetch();
    const dialog = useDialog();
    const t = useT();
    const { challenges, fetchChallenges, addChallenge, updateChallenge, deleteChallenge, toggleChallengeCompletion } = useChallengeStore();
    const { categories, fetchCategories } = useCategoryStore();

    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);
    const [selectedChallengeId, setSelectedChallengeId] = React.useState<string | null>(null);
    const selectedChallenge = challenges.find(c => c.id === selectedChallengeId) ?? null;

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalMode, setModalMode] = React.useState<'create' | 'edit'>('create');

    const hasFetchedData = React.useRef(false);

    React.useEffect(() => {
        if (!hasFetchedData.current) {
            fetchChallenges(authFetch);
            fetchCategories(authFetch);
            hasFetchedData.current = true;
        }
    }, [authFetch, fetchChallenges, fetchCategories]);

    React.useEffect(() => {
        if (categories.length > 0 && selectedCategoryIds.length === 0) {
            setSelectedCategoryIds(categories.map(c => c.id));
        }
    }, [categories, selectedCategoryIds]);

    const toggleCategory = (toggledId: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(toggledId)
                ? prev.filter(id => id !== toggledId)
                : [...prev, toggledId]
        );
    };

    const filteredChallenges = React.useMemo(
        () => challenges.filter(c => selectedCategoryIds.includes(c.categoryId)),
        [challenges, selectedCategoryIds]
    );

    const handleCreateNew = () => { setSelectedChallengeId(null); setModalMode('create'); setIsModalOpen(true); };
    const handleEditClick = () => { if (!selectedChallenge) return; setModalMode('edit'); setIsModalOpen(true); };

    const handleDelete = async () => {
        if (!selectedChallenge) return;
        const ok = await dialog.confirmDanger({
            title: t.challenge.deleteTitle,
            message: t.challenge.deleteMessage(selectedChallenge.title),
        });
        if (!ok) return;
        const error = await deleteChallenge(authFetch, selectedChallenge.id);
        if (error) { await dialog.notify({ title: t.alert.deleteFailed, message: error }); return; }
        setSelectedChallengeId(null);
    };

    const handleSaveChallenge = async (data: ChallengeData): Promise<void> => {
        let error: string | null;
        if (modalMode === 'edit' && selectedChallenge) {
            error = await updateChallenge(authFetch, selectedChallenge.id, data);
        } else {
            // 정오로 저장하면 어느 시간대에서 읽어도 같은 달력일로 해석된다
            const startAt = `${localDateKey(new Date())}T12:00:00.000Z`;
            error = await addChallenge(authFetch, { ...data, startAt });
        }
        // 실패했는데 모달을 닫으면 사용자는 저장된 줄 안다
        if (error) { await dialog.notify({ title: t.alert.saveFailed, message: error }); return; }
        setIsModalOpen(false);
    };

    /* 날 셈은 날짜 키로 (src/lib/challengeDays.ts) — 오늘은 사용자가 고른 시간대의 날이고 자정을 넘기면 바뀐다.
       예전엔 고른 순간의 기기 날짜에 묶여서, 밤을 넘겨 켜 둔 화면에서 "오늘 달성"을 누르면 어제 칸이 찍혔다 */
    const todayKey = useCurrentDayKey();

    const isTodayValidDay = React.useMemo(
        () => !!selectedChallenge && slotIndexOn(selectedChallenge, todayKey) !== null,
        [selectedChallenge, todayKey]
    );

    const isCompletedToday = React.useMemo(() => {
        if (!selectedChallenge || !isTodayValidDay) return false;
        return (selectedChallenge.completions ?? []).some(comp => completionKey(comp) === todayKey);
    }, [selectedChallenge, isTodayValidDay, todayKey]);

    const handleToggleToday = async () => {
        if (!selectedChallenge || !isTodayValidDay) return;
        await toggleChallengeCompletion(authFetch, selectedChallenge.id, completionTargetFor(todayKey));
    };

    const isChallengeEnded = React.useMemo(
        () => !!selectedChallenge && challengeExpired(selectedChallenge, todayKey),
        [selectedChallenge, todayKey]
    );

    const themeProps = {
        categories, challenges: filteredChallenges, selectedCategoryIds, toggleCategory,
        selectedChallenge, setSelectedChallengeId,
        handleCreateNew, handleEditClick, handleDelete, handleToggleToday, isCompletedToday,
        isTodayValidDay,
        isChallengeEnded, todayKey,
        isModalOpen, setIsModalOpen, modalMode, handleSaveChallenge,
    };

    return <ChallengeView {...themeProps} />;
}
