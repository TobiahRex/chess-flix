import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { parseCentipawn } from '../../utils';
import EvalGraph from '../EvalGraph';

const PreviewGame = ({ gameData, gameIx, updateGame }) => {
  const [preview, setPreview] = useState(gameData.startingPosition);
  const [speed, setSpeed] = useState(1);
  const [evaluation, setEvaluation] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [orientation, setBoardOrientation] = useState('white');
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

  const handleSetPosition = () => {
    clearInterval(timerId.current);
    const moves = gameRef.current.history().slice(0, currentIndex + 1);
    updateGame(moves.slice(0));
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
                  fontWeight: currentIndex === index ? 'bold' : 'normal',
                }}
              >
                {index % 2 === 0
                  ? `${Math.floor(index / 2) + 1}. ${move.san}`
                  : move.san}
              </button>
            ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={handlePreviousMove} style={{ cursor: 'pointer' }}>
            ⏮
          </button>
          <button type="button" onClick={handlePlayPause} style={{ cursor: 'pointer' }}>
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button type="button" onClick={handleNextMove} style={{ cursor: 'pointer' }}>
            ⏩
          </button>
          <button
            type="button"
            onClick={() => setBoardOrientation(orientation === 'white' ? 'black' : 'white')}
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
            <span style={{ color: 'green' }}>{parseCentipawn(evaluation)}</span>
          ) : (
            <span style={{ color: 'red' }}>{parseCentipawn(evaluation)}</span>
          )}
        </div>
        <EvalGraph gameRef={gameRef} gameData={gameData} />
      </div>
      <div style={{ display: 'flex', gap: '10px', maxWidth: '100px' }}>
        Speed&nbsp;
        <input
          id={`speed-${gameIx}`}
          name={`speed-${gameIx}`}
          type="range"
          value={speed}
          min="0.5"
          max="5"
          onChange={(e) => setSpeed(e.target.value)}
        />
        <label htmlFor={`speed-${gameIx}`}>
          {speed}s
        </label>
      </div>
    </div>
  );
};

const PreviewGames = ({ games, updateGame }) => {
  return (
    <div
      id="game-grid"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        maxWidth: '100%',
      }}
    >
      {games.map((gameData, index) => (
        <PreviewGame
          key={index}
          gameData={gameData}
          gameIx={index}
          updateGame={updateGame}
        />
      ))}
    </div>
  );
};

export default PreviewGames;
