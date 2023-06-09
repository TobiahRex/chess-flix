import React, { useState } from 'react';
import { Chess, validateFen } from 'chess.js';
import GameSubmission from './components/GameSubmission';
import GameData from './components/GameData';
import CurrentGame from './components/CurrentGame';
import PreviewGames from './components/PreviewGames';
import ChessData from './components/ChessData';
import './App.css';
import AnalysisControls from './components/AnalysisControls';
import { handleGetPreviews, handleGetCurrentEval } from './services';

const App = () => {
  const [games, setGamePreviews] = useState([]);
  const [previewCount, setPreviewCount] = useState(1);
  const [depth, setDepth] = useState(5);
  const [gameData, setGameData] = useState({ type: '', game: null, move: 0 });
  const [fetching, setFetching] = useState(false);
  const [currentEval, setCurrentEval] = useState(0);
  const [targetPosition, setTargetPosition] = useState('');

  const handleGameSubmission = (text) => {
    const chess = new Chess();
    if (validateFen(text).ok) {
      chess.load(text);
      setGameData({
        type: 'fen',
        game: chess,
        move: 0,
      });
    } else {
      chess.loadPgn(text);
      setGameData({
        type: 'pgn',
        game: chess,
        move: 0,
      });
    }
  };

  const getPreviews = async () => {
    if (previewCount > 0) {
      setFetching(true);
      const data = await handleGetPreviews({
        fen: targetPosition,
        previewCount,
        depth,
      });
      const { previews } = data;
      setFetching(false);
      setGamePreviews(previews);
    } else {
      setGamePreviews([]);
    }
  };

  const getPositionEval = async (fen) => {
    const data = await handleGetCurrentEval({ fen });
    const { evaluation } = data;
    setFetching(false);
    setCurrentEval(evaluation);
  };

  const handleUpdateGame = (movesToAdd) => {
    const chess = new Chess();
    const history = gameData.game?.history({ verbose: true });
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      if (move.after !== targetPosition) {
        chess.move(move);
      } else {
        chess.move(move);
        break;
      }
    }
    movesToAdd.forEach((move) => chess.move(move));
    setGameData({
      type: 'fen',
      game: chess,
      move: 0,
    });
    setTargetPosition(
      chess.history({ verbose: true }).slice(-1)[0].after
    );
  };

  const handleSetCurrentGame = (game) => {
    setGameData({
      type: 'fen',
      game,
      move: 0,
    });
    setTargetPosition(
      game.history({ verbose: true }).slice(-1)[0].after
    );
  };

  return (
    <div className="App">
      <h1>Chess Flix</h1>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
        <GameSubmission handleGameSubmission={handleGameSubmission} />
        <GameData gameData={gameData} />
      </div>
      <hr />
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <CurrentGame
          currentEval={currentEval}
          gameData={gameData}
          setTargetPosition={setTargetPosition}
          getPositionEval={getPositionEval}
        />
        <ChessData setCurrentGame={handleSetCurrentGame} />
      </div>
      <hr />
      <AnalysisControls
        fetching={fetching}
        depth={depth}
        setDepth={setDepth}
        previewCount={previewCount}
        setPreviewCount={setPreviewCount}
        handleGetPreviews={getPreviews}
      />
      <hr />
      <PreviewGames games={games} updateGame={handleUpdateGame}  />
    </div>
  );
};

export default App;
