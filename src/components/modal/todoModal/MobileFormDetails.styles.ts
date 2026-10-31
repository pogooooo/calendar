import styled, { createGlobalStyle } from 'styled-components';

/** Applies to the native mobile policy, independently of web viewport width. */
export const MobileFormDetails = createGlobalStyle`
    .todo-extra { min-width:0; }
    [data-todo-form] .todo-footer {flex-wrap:wrap;}
    [data-todo-form] .todo-save-state {flex-basis:100%;font-size:.85rem;line-height:1.5;overflow-wrap:anywhere;}
    [data-todo-form] .todo-save-state:empty {display:none;}
    @media(max-width:768px) {
        [data-todo-form] label:has(>input[type=checkbox]) {min-width:48px !important;width:48px !important;height:48px !important;}
        [data-todo-form] label:has(>input[type=checkbox]) .slider {top:13px !important;bottom:13px !important;}
    }
    [data-mobile-todo] {
        min-height:0; max-height:100%;
        .title-input {font-size:1.15rem;min-height:48px;}
        .title-input::placeholder {color:${({theme})=>theme.colors.textSecondary};opacity:1;}
        button, input:not([type=checkbox]), select {min-height:48px !important;}
        .close-btn {min-width:48px;min-height:48px;flex-shrink:0;}
        label:has(> input[type=checkbox]) {height:48px !important;}
        label:has(> input[type=checkbox]) .slider {top:13px !important;bottom:13px !important;}
        label:has(> input[type=checkbox]:focus-visible) {outline:2px solid ${({theme})=>theme.colors.primary};outline-offset:2px;}
        .todo-extra {border-top:1px solid ${({theme})=>theme.colors.border};margin-top:8px;}
        .todo-extra summary {
            cursor:pointer;min-height:64px;padding:12px 4px;font-weight:650;
            color:${({theme})=>theme.colors.text};
        }
        .todo-extra summary span {display:block;font-size:.8rem;font-weight:400;margin:4px 0 0 17px;color:${({theme})=>theme.colors.textSecondary};}
        .todo-extra summary:focus-visible {outline:2px solid ${({theme})=>theme.colors.primary};outline-offset:2px;}
        .todo-save-state {flex-basis:100%;font-size:.85rem;line-height:1.4;overflow-wrap:anywhere;}
        .todo-save-state:empty {display:none;}
        .todo-footer {flex-wrap:wrap;}
        :is(input,textarea,button):focus-visible {outline:2px solid ${({theme})=>theme.colors.primary};outline-offset:2px;}
    }
`;

export const SavedNotice = styled.div`
    position:fixed;z-index:10000;bottom:calc(78px + env(safe-area-inset-bottom));
    left:16px;right:16px;max-width:420px;margin-inline:auto;padding:14px 18px;
    background:${({theme})=>theme.colors.surface};color:${({theme})=>theme.colors.text};
    border:1px solid ${({theme})=>theme.colors.primary};box-shadow:0 6px 24px #0003;
    font-size:1rem;font-weight:600;pointer-events:none;
`;
