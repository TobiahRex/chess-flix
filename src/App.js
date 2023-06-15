import React, { useState } from 'react';
import { Chess, validateFen } from 'chess.js';
import GameSubmission from './components/GameSubmission';
import GameData from './components/GameData';
import CurrentGame from './components/CurrentGame';
import PreviewGames from './components/PreviewGames';
import ChessData from './components/ChessData';
import './App.css';
import AnalysisControls from './components/AnalysisControls';
import { handleGetPreviews, handleGameReset } from './services';

const App = () => {
  const [games, setGamePreviews] = useState([]);
  const [previewCount, setPreviewCount] = useState(3);
  const [depth, setDepth] = useState(20);
  const [gameData, setGameData] = useState({ type: '', game: null, move: 0 });
  const [fetching, setFetching] = useState(false);
  const [orientation, setOrientation] = useState('white');
  const [targetPosition, setTargetPosition] = useState('');

  const handleGameSubmission = async (text) => {
    const res = await handleGameReset();
    if (res.error) {
      alert(res.error);
      return;
    }
    const chess = new Chess();
    if (validateFen(text).ok) {
      chess.load(text);
      setGameData({
        type: 'fen',
        game: chess,
        move: 0,
      });
      setTargetPosition(chess.fen());
    } else {
      chess.loadPgn(text);
      setGameData({
        type: 'pgn',
        game: chess,
        move: 0,
      });
      setTargetPosition('start');
    }
    setFetching(false);
    setPreviewCount(3);
    setDepth(20);
    setGamePreviews([]);
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

  const handleSetCurrentGame = (game, type) => {
    setGameData({
      type,
      game,
      move: 0,
    });
    if (game.history().length) {
      setTargetPosition(
        game.history({ verbose: true }).slice(-1)[0].after
      );
    } else {
      setTargetPosition('start');
    }
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
          orientation={orientation}
          gameData={gameData}
          setTargetPosition={setTargetPosition}
          setCurrentGame={handleSetCurrentGame}
          setOrientation={setOrientation}
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
      <PreviewGames
        games={games}
        orientation={orientation}
        setCurrentGame={handleSetCurrentGame}
      />
    </div>
  );
};

export default App;
