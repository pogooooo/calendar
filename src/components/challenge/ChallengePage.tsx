"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialChallenge from "./celestial/CelestialChallenge";
import BotanicalChallenge from "./botanical/BotanicalChallenge";

import { useAuthFetch } from "@/hooks/useAuthFetch";
import useChallengeStore from "@/store/useChallengeStore";
import useCategoryStore from "@/store/useCategoryStore";
import { ChallengeData } from "@/components/modal/challengeModal/ChallengeModal";

export default function ChallengePage() {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    const authFetch = useAuthFetch();
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
        if (window.confirm("정말 이 챌린지를 삭제하시겠습니까?")) {
            await deleteChallenge(authFetch, selectedChallenge.id);
            setSelectedChallengeId(null);
        }
    };

    const handleSaveChallenge = async (data: ChallengeData): Promise<void> => {
        if (modalMode === 'edit' && selectedChallenge) {
            await updateChallenge(authFetch, selectedChallenge.id, data);
        } else {
            const now = new Date();
            const localStartAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
            await addChallenge(authFetch, { ...data, startAt: localStartAt.toISOString() });
        }
        setIsModalOpen(false);
    };

    const toDateKey = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    const todayValidSlot = React.useMemo(() => {
        if (!selectedChallenge) return null;
        const start = new Date(selectedChallenge.startAt);
        start.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffMs = today.getTime() - start.getTime();
        if (diffMs < 0) return null;
        const diffDays = Math.round(diffMs / 86400000);
        if (diffDays % selectedChallenge.interval !== 0) return null;
        const slotIndex = diffDays / selectedChallenge.interval;
        const target = selectedChallenge.targetCount ?? null;
        if (target !== null && slotIndex >= target) return null;
        return new Date(start.getFullYear(), start.getMonth(), start.getDate() + diffDays, 12, 0, 0);
    }, [selectedChallenge]);

    const isCompletedToday = React.useMemo(() => {
        if (!selectedChallenge || !todayValidSlot) return false;
        const todayKey = toDateKey(todayValidSlot);
        return selectedChallenge.completions.some(comp => {
            const d = new Date(comp.targetDate);
            return toDateKey(d) === todayKey;
        });
    }, [selectedChallenge, todayValidSlot]);

    const handleToggleToday = async () => {
        if (!selectedChallenge || !todayValidSlot) return;
        await toggleChallengeCompletion(
            authFetch,
            selectedChallenge.id,
            todayValidSlot.toISOString()
        );
    };

    const isChallengeEnded = React.useMemo(() => {
        if (!selectedChallenge) return false;
        const target = selectedChallenge.targetCount ?? null;
        if (target === null) return false;
        const start = new Date(selectedChallenge.startAt);
        start.setHours(0, 0, 0, 0);
        const lastSlot = new Date(start);
        lastSlot.setDate(start.getDate() + (target - 1) * selectedChallenge.interval);
        lastSlot.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today > lastSlot;
    }, [selectedChallenge]);

    const themeProps = {
        categories, challenges: filteredChallenges, selectedCategoryIds, toggleCategory,
        selectedChallenge, setSelectedChallengeId,
        handleCreateNew, handleEditClick, handleDelete, handleToggleToday, isCompletedToday,
        isTodayValidDay: todayValidSlot !== null,
        isChallengeEnded,
        isModalOpen, setIsModalOpen, modalMode, handleSaveChallenge,
    };

    if (themeName.startsWith('celestial')) return <CelestialChallenge {...themeProps} />;
    if (themeName === 'botanical') return <BotanicalChallenge {...themeProps} />;
    return null;
}
