import React from 'react';
import GameBoard from './components/GameBoard';
import styled from 'styled-components';

const AppContainer = styled.div`
  text-align: center;
  font-family: 'Arial', sans-serif;
  background-color: #f0f0f0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

function App() {
  return (
    <AppContainer>
      <GameBoard />
    </AppContainer>
  );
}

export default App;
