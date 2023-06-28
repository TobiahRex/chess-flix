import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { parseCentipawn } from '../../utils';
import EvalGraph from '../EvalGraph';

const PreviewGame = ({ gameData, gameIx, setCurrentGame, boardOrientation }) => {
  const [preview, setPreview] = useState(gameData.startingPosition);
  const [speed, setSpeed] = useState(10);
  const [evaluation, setEvaluation] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [orientation, setBoardOrientation] = useState(boardOrientation);
  const timerId = useRef(null);
  const gameRef = useRef(new Chess());

  useEffect(() => {
    if (timerId.current) {
      clearInterval(timerId.current);
    }
    const chess = new Chess(gameData.startingPosition);
    gameData.moves.forEach((move) => chess.move(move));
    gameRef.current = chess;

    const playMove = (index) => {
      const { after } = chess.history({ verbose: true })[index];
      setPreview(after);
      setEvaluation(gameData.evaluations[index]);
      setCurrentIndex(index);
    };

    if (isPlaying) {
      timerId.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % gameData.moves.length;
        playMove(nextIndex);
      }, speed * 1000);
    }

    return () => {
      clearInterval(timerId.current);
    };
  }, [gameData, speed, currentIndex, isPlaying]);

  const handlePreviousMove = () => {
    clearInterval(timerId.current);
    const previousIndex = (currentIndex - 1 + gameData.moves.length) % gameData.moves.length;
    setCurrentIndex(previousIndex);
    playMove(previousIndex);
  };

  const handleNextMove = () => {
    clearInterval(timerId.current);
    const nextIndex = (currentIndex + 1) % gameData.moves.length;
    setCurrentIndex(nextIndex);
    playMove(nextIndex);
  };

  const handlePlayPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  const handleSetPosition = (movesToAdd) => {
    clearInterval(timerId.current);
    const currentPosition = gameRef.current.history({ verbose: true })[currentIndex]?.after;
    const originalHistory = gameData.game?.history({ verbose: true });
    const originalPreMoves = originalHistory.slice(0, currentIndex + 1);
    const chess = new Chess();
    for (let i = 0; i < originalHistory.length; i++) {
      const move = originalHistory[i];
      if (move.after !== currentPosition) {
        chess.move(move);
      } else {
        chess.move(move);
        break;
      }
    }
    movesToAdd.forEach((move) => chess.move(move));
    setCurrentGame(chess, 'fen');
  };

  const playMove = useCallback((index) => {
    const { after } = gameRef.current.history({ verbose: true })[index];
    setPreview(after);
    setEvaluation(gameData.evaluations[index]);
    setCurrentIndex(index);
  }, [gameData]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        margin: '20px',
        flexWrap: 'wrap',
        maxWidth: '350px',
        gap: '10px',
        boxShadow: '5px 1px 15px rgba(0, 0, 0, .3)',
        padding: '10px',
        borderRadius: '10px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          {gameRef.current
            ?.history({ verbose: true })
            ?.map((move, index) => (
              <button
                key={index}
                onClick={() => playMove(index)}
                style={{
                  border: 'none',
                  padding: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  background: 'none',
                  color: currentIndex === index ? '#57EAFF' : '#BABABA',
                }}
              >
                {index % 2 === 0
                  ? `${Math.floor(index / 2) + 1}. ${move.san}`
                  : move.san}
              </button>
            ))}
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button type="button" onClick={handlePreviousMove} style={{ cursor: 'pointer', fontSize: '24px' }}>
            ⏪
          </button>
          <button type="button" onClick={handlePlayPause} style={{ cursor: 'pointer', fontSize: '24px' }}>
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button type="button" onClick={handleNextMove} style={{ cursor: 'pointer', fontSize: '24px' }}>
            ⏩
          </button>
          <button
            type="button"
            onClick={() => setBoardOrientation(orientation === 'white' ? 'black' : 'white')}
            style={{ cursor: 'pointer', 'fontSize': '24px' }}
          >
            🔄
          </button>
          <button
            disabled={gameData.type === 'fen' || isPlaying}
            type="button"
            onClick={handleSetPosition}
            style={{ cursor: 'pointer' }}
          >
            Set Position
          </button>
        </div>
      </div>
      <Chessboard
        position={preview}
        pgn=""
        draggable={false}
        boardWidth={350}
        animationDuration={300}
        boardOrientation={orientation}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          Evaluation&nbsp;
          {evaluation > 0 ? (
            <span style={{ color: 'lawngreen' }}>{parseCentipawn(evaluation)}</span>
          ) : (
            <span style={{ color: 'red' }}>{parseCentipawn(evaluation)}</span>
          )}
        </div>
        <EvalGraph history={gameRef.current.history({ verbose: 'true' }) || []} evals={gameData.evaluations} />
      </div>
      <div style={{ display: 'flex', gap: '10px', maxWidth: '100px' }}>
        Speed&nbsp;
        <input
          id={`speed-${gameIx}`}
          name={`speed-${gameIx}`}
          type="range"
          value={speed}
          min="0.5"
          max="10"
          onChange={(e) => setSpeed(e.target.value)}
        />
        <label htmlFor={`speed-${gameIx}`}>
          {speed}s
        </label>
      </div>
    </div>
  );
};

const PreviewGames = ({ games, updateGame, orientation }) => {
  return (
    <div
      id="game-grid"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      {games.map((gameData, index) => (
        <PreviewGame
          key={index}
          gameData={gameData}
          gameIx={index}
          updateGame={updateGame}
          boardOrientation={orientation}
        />
      ))}
    </div>
  );
};

export default PreviewGames;
