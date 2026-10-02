import styled, { keyframes } from 'styled-components';
const arrive = keyframes`from { opacity:0; } to { opacity:1; }`;
export const Page = styled.div`position:relative; height:100%; animation:${arrive} .45s ease-out both;`;
