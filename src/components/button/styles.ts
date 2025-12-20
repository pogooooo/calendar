import { css } from 'styled-components';

export const celestialButtonStyles = css`
  background-color: transparent;
  border: 1px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.text};
  
  &:hover {
    border-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 0 5px 1px ${(props) => props.theme.colors.accent};
  }
`;

export const lightButtonStyles = css`
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  
  &:hover {
    background-color: #f1f5f9;
    border-color: #cbd5e1;
  }
`;
