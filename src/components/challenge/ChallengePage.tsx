"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialChallenge from "./celestial/CelestialChallenge";

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

    const isCompletedToday = React.useMemo(() => {
        if (!selectedChallenge) return false;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        return selectedChallenge.completions.some(comp => {
            const d = new Date(comp.targetDate);
            return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` === todayStr;
        });
    }, [selectedChallenge]);

    const handleToggleToday = async () => {
        if (!selectedChallenge) return;
        const now = new Date();
        await toggleChallengeCompletion(
            authFetch,
            selectedChallenge.id,
            new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).toISOString()
        );
    };

    const themeProps = {
        categories, challenges: filteredChallenges, selectedCategoryIds, toggleCategory,
        selectedChallenge, setSelectedChallengeId,
        handleCreateNew, handleEditClick, handleDelete, handleToggleToday, isCompletedToday,
        isModalOpen, setIsModalOpen, modalMode, handleSaveChallenge,
    };

    if (themeName === 'celestial') return <CelestialChallenge {...themeProps} />;
    return <CelestialChallenge {...themeProps} />;
}
