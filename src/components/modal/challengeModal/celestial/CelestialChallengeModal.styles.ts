import styled from "styled-components";

export const ModalHeader = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 1.1rem;
    color: ${(props) => props.theme.colors.text};
    padding: 15px 20px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
    background-color: ${(props) => props.theme.colors.primary}0D;
`;

export const ModalBody = styled.div`
    padding: 20px;
    overflow-y: auto;
`;

export const FormArea = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;

    .form-group-row { display: flex; gap: 10px; }

    .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;

        label { font-size: 0.8rem; color: ${(props) => props.theme.colors.textSecondary}; }

        input, select {
            background: ${(props) => props.theme.colors.surface};
            border: 1px solid ${(props) => props.theme.colors.primary}55;
            border-radius: 4px;
            padding: 8px 10px;
            color: ${(props) => props.theme.colors.text};
            font-size: 0.9rem;
            outline: none;
            &:focus { border-color: ${(props) => props.theme.colors.primary}; }
        }
    }

    .form-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
`;