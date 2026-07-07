import styled from "styled-components";

export const ModalHeader = styled.div`
    font-family: ${(props) => props.theme.fonts.body};
    font-size: 1.1rem;
    font-weight: 500;
    color: ${(props) => props.theme.colors.text};
    padding: 15px 20px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    background-color: ${(props) => props.theme.colors.background};
    border-radius: 12px 12px 0 0;
`;

export const ModalBody = styled.div`
    padding: 20px;
    overflow-y: auto;
    background-color: ${(props) => props.theme.colors.surface};
`;

export const FormArea = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-family: ${(props) => props.theme.fonts.body};

    .form-group-row { display: flex; gap: 10px; }

    .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
            font-size: 0.8rem;
            color: ${(props) => props.theme.colors.textSecondary};
        }

        input, select {
            background: ${(props) => props.theme.colors.background};
            border: 1px solid ${(props) => props.theme.colors.border};
            border-radius: 8px;
            padding: 8px 10px;
            color: ${(props) => props.theme.colors.text};
            font-size: 0.9rem;
            font-family: inherit;
            outline: none;
            transition: border-color 0.2s ease;
            &:focus { border-color: ${(props) => props.theme.colors.primary}; }
        }
    }

    .form-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
`;
