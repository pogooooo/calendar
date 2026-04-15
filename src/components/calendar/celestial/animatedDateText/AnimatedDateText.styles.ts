import styled from "styled-components";

export const DateTextContainer = styled.div`
    display: flex;
    align-items: center;
    height: 1.5em;
    overflow: hidden;
`;

export const DateCharWrapper = styled.span<{ $char: string }>`
    position: relative;
    display: inline-flex;
    justify-content: center;
    width: ${(props) => [' ', '.', '-'].includes(props.$char) ? 'auto' : '0.65em'};
`;