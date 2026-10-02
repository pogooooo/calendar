import styled from "styled-components";

export const SearchRow = styled.div`
    display: flex; align-items: center; gap: 10px; padding: 14px;
    color: ${p => p.theme.colors.primary}; border-bottom: 1px solid ${p => p.theme.colors.primary}33;
`;
export const Input = styled.input`
    min-width: 0; flex: 1; padding: 6px 0; border: none; background: transparent;
    color: ${p => p.theme.colors.text}; font: inherit;
    &::placeholder { color: ${p => p.theme.colors.textSecondary}; }
`;
export const Close = styled.button`
    display: grid; place-items: center; flex-shrink: 0; width: 36px; height: 36px;
    border: none; background: transparent; color: inherit; cursor: pointer;
`;
export const Results = styled.div`
    padding: 8px; max-height: 55dvh; overflow-y: auto;
`;
export const Result = styled.button<{ $selected: boolean }>`
    display: flex; align-items: center; justify-content: space-between; width: 100%;
    min-height: 44px; padding: 10px 14px; border: none; border-radius: 6px; font: inherit;
    color: ${p => p.theme.colors.text}; cursor: pointer;
    background: ${p => p.$selected ? p.theme.colors.primary + '22' : 'transparent'};
    transition: background 140ms ease;
`;
export const Empty = styled.p`
    padding: 12px; color: ${p => p.theme.colors.textSecondary};
`;
