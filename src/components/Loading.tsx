import styled from "styled-components";

export const Loading = () => {
  return (
    <LoadingOverlay>
      <Spinner />
      <LoadingText>Analyzing Transcript...</LoadingText>
    </LoadingOverlay>
  );
};

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border-left-color: #ff7a59;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.h3`
  font-family: "Space Grotesk", sans-serif;
  color: #1c1c1e;
  margin-top: 1rem;
`;

export { LoadingOverlay, Spinner, LoadingText };
