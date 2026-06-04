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
    const selectedChallenge = challenges.find(c => c.id === selectedChallengeId) || null;

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalMode, setModalMode] = React.useState<'create' | 'edit'>('create');

    const [leftRatio, setLeftRatio] = React.useState(50);
    const [topRatio, setTopRatio] = React.useState(50);

    const contentRef = React.useRef<HTMLDivElement>(null);
    const rightPanelRef = React.useRef<HTMLDivElement>(null);
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

    const handleHResize = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startRatio = leftRatio;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (contentRef.current) {
                const rect = contentRef.current.getBoundingClientRect();
                const deltaX = moveEvent.clientX - startX;
                const deltaRatio = (deltaX / rect.width) * 100;
                const newRatio = startRatio + deltaRatio;
                if (newRatio > 20 && newRatio < 80) setLeftRatio(newRatio);
            }
        };
        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const handleVResize = (e: React.MouseEvent) => {
        e.preventDefault();
        const startY = e.clientY;
        const startRatio = topRatio;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (rightPanelRef.current) {
                const rect = rightPanelRef.current.getBoundingClientRect();
                const deltaY = moveEvent.clientY - startY;
                const deltaRatio = (deltaY / rect.height) * 100;
                const newRatio = startRatio + deltaRatio;
                if (newRatio > 20 && newRatio < 80) setTopRatio(newRatio);
            }
        };
        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const toggleCategory = (toggledId: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(toggledId)
                ? prev.filter(id => id !== toggledId)
                : [...prev, toggledId]
        );
    };

    const filteredChallenges = React.useMemo(() => {
        return challenges.filter(c => selectedCategoryIds.includes(c.categoryId));
    }, [challenges, selectedCategoryIds]);

    const handleCreateNew = () => {
        setSelectedChallengeId(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEditClick = () => {
        if (!selectedChallenge) return;
        setModalMode('edit');
        setIsModalOpen(true);
    };

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
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        return selectedChallenge.completions.some(comp => {
            const d = new Date(comp.targetDate);
            const compStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return compStr === todayStr;
        });
    }, [selectedChallenge]);

    const handleToggleToday = async () => {
        if (!selectedChallenge) return;

        const now = new Date();
        const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
        const targetDate = localDate.toISOString();

        await toggleChallengeCompletion(authFetch, selectedChallenge.id, targetDate);
    };

    const themeProps = {
        categories,
        challenges: filteredChallenges,
        selectedCategoryIds,
        toggleCategory,
        selectedChallenge,
        setSelectedChallengeId,
        handleCreateNew,
        handleEditClick,
        handleDelete,
        handleToggleToday,
        isCompletedToday,
        isModalOpen,
        setIsModalOpen,
        modalMode,
        handleSaveChallenge,
        leftRatio,
        topRatio,
        handleHResize,
        handleVResize,
        contentRef,
        rightPanelRef
    };

    if (themeName === 'celestial') {
        return <CelestialChallenge {...themeProps} />;
    }

    return <CelestialChallenge {...themeProps} />;
}