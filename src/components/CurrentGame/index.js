import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

import EvalGraph from '../EvalGraph';
import { handleGetGameEvals, handleGetPsxnEval, handleGameReset } from '../../services';


const CurrentGame = (props) => {
  const {
    gameData,
    orientation,
    setTargetPosition,
    setCurrentGame,
    setOrientation,
  } = props;
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [boardPosition, setBoardPosition] = useState(gameData.game?.fen() || 'start');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fetching, setFetching] = useState(false);
  const [evals, setEvals] = useState([]);
  const [singleEval, setSingleEval] = useState(0);
  const timerId = useRef(null);

  const handleNextMove = useCallback(() => {
    if (currentMoveIndex < gameData.game?.history().length - 1) {
      const move = gameData.game?.history({ verbose: true })[currentMoveIndex + 1];
      const targetFen = move.after;
      setCurrentMoveIndex((prevIndex) => prevIndex + 1);
      setBoardPosition(targetFen);
      setTargetPosition(targetFen);
    } else {
      const move = gameData.game?.history({ verbose: true })[0];
      const targetFen = move?.after || 'start';
      setCurrentMoveIndex(0);
      setBoardPosition(targetFen);
      setTargetPosition(targetFen);
    }
  }, [currentMoveIndex, gameData, setTargetPosition]);

  const handlePreviousMove = useCallback(() => {
    if (currentMoveIndex > 0) {
      const move = gameData.game?.history({ verbose: true })[currentMoveIndex - 1];
      const targetFen = move.after;
      setCurrentMoveIndex((prevIndex) => prevIndex - 1);
      setBoardPosition(targetFen);
      setTargetPosition(targetFen);
    }
  }, [currentMoveIndex, gameData, setTargetPosition]);

  const handleReset = useCallback(() => { // TODO - there's a bug here
    const history = gameData.game?.history({ verbose: true });
    const targetFen = Array.isArray(history) ? history[0]?.after || 'start' : 'start';
    setBoardPosition(targetFen);
    setCurrentMoveIndex(0);
  }, [gameData]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  }, []);

  const handlePositionChange = async (from, to) => {
    let targetFen = '';
    let isLegal = false;
    try {
      if (gameData.game) {
        isLegal = gameData.game.move({
          from,
          to,
        });
        targetFen = gameData.game.fen();
        setTargetPosition(targetFen);
      } else {
        const newGame = new Chess();
        isLegal = newGame.move({
          from,
          to,
        });
        setCurrentGame(newGame, 'fen');
        targetFen = newGame.fen();
      }
      setCurrentMoveIndex((prevIndex) => prevIndex + 1);
      setBoardPosition(targetFen);
      setFetching(true);
      const res = await handleGetPsxnEval({ fen: targetFen });
      const { evaluation } = res;
      setFetching(false);
      setEvals((prevEvals) => prevEvals.slice(0).concat(evaluation));
      return isLegal;
    } catch (e) {
      alert(e.message);
    }
    finally {
      setFetching(false);
      setBoardPosition((prevPosition) => prevPosition);
      return isLegal;
    }
  };

  const handleNotationClick = useCallback(
    (move) => {
      setCurrentMoveIndex(move.index - 1);
      const targetFen = move.after;
      setBoardPosition(targetFen);
      setTargetPosition(targetFen);
    },
    [setTargetPosition]
  );

  const handleNewGame = useCallback(async () => {
    await handleGameReset();
    setCurrentGame(new Chess(), 'fen');
    setCurrentMoveIndex(0);
    setEvals([]);
    setSingleEval(0);
  }, [setCurrentGame]);

  useEffect(() => {
    const getManyEvals = async (moves) => {
      setFetching(true);
      const evals = await handleGetGameEvals({
        fen: moves[0]?.before || gameData.game?.fen() || 'start',
        moves: moves.map((move) => move.lan),
      })
      setEvals(evals?.evaluations || []);
      setFetching(false);
    };
    const history = gameData.game?.history({ verbose: true });
    if (gameData.game?.history().length && !fetching) {
      getManyEvals(history);
    }
    const firstMove = Array.isArray(history) ? history[0] || {} : {};
    const targetFen = firstMove?.after || gameData.game?.fen() || 'start';
    setBoardPosition(targetFen);
    setTargetPosition(targetFen);
    setCurrentMoveIndex(0);
    return () => {
      clearInterval(timerId.current);
    };
  }, [gameData]);

  useEffect(() => {
    if (isPlaying) {
      timerId.current = setInterval(handleNextMove, speed * 1000);
    } else {
      clearInterval(timerId.current);
    }

    return () => {
      clearInterval(timerId.current);
    };
  }, [handleNextMove, isPlaying, speed]);

  const renderMoveList = useCallback(() => {
    if (!gameData.game) return '';

    const gameMoves = gameData.game?.history({ verbose: true });
    const moveList = [];

    for (let index = 0; index < gameMoves.length; index += 2) {
      const move1 = {
        ...gameMoves[index],
        index: index + 1,
      };

      const move2 = {
        ...gameMoves[index + 1],
        index: index + 2,
      };

      moveList.push([move1, move2]);
    }

    return (
      <ol style={{ marginTop: '0px', overflow: 'scroll', maxHeight: '550px' }}>
        {moveList.map((movePair, index) => (
          <li key={index} style={{ textAlign: 'left' }}>
            <button
              onClick={() => handleNotationClick(movePair[0])}
              style={{
                border: 'none',
                padding: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                background: 'none',
                color: movePair[0].index - 1 === currentMoveIndex ? '#57EAFF' : '#BABABA',
              }}
            >
              {`${movePair[0].san}, `}
            </button>
            {movePair[1] && (
              <button
                onClick={() => handleNotationClick(movePair[1])}
                style={{
                  border: 'none',
                  padding: 'none',
                  marginRight: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  background: 'none',
                  color: movePair[1].index - 1 === currentMoveIndex ? '#57EAFF' : '#BABABA',
                }}
              >
                {movePair[1].san}
              </button>
            )}
          </li>
        ))}
      </ol>
    );
  }, [currentMoveIndex, gameData.game, handleNotationClick]);

  const nextEval = evals[currentMoveIndex] || evals[currentMoveIndex - 1];
  return (
    <div id="current-game" style={{ display: 'flex', gap: '20px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <button
          onClick={handleNewGame}
          style={{ width: '150px', height: '40px', fontSize: '20px' }}
        >
          New Game
        </button>
        <>
          <strong>Current Evaluation</strong>
          <strong
            style={{
              fontSize: '20px',
              color: nextEval ? (nextEval > 0 ? 'lawngreen' : 'red') : 'black',
            }}
          >
            {
              fetching
                ? '...'
                : (nextEval ? nextEval / 100 + ' ' : 0)
            }
          </strong>
        </>
        {
          gameData.game?.header()?.White
          ? (
            <div>
              <strong>
                {
                  orientation === 'white'
                    ? `${gameData.game?.header()?.Black}: ${gameData.game?.header()?.BlackElo}`
                    : `${gameData.game?.header()?.White}: ${gameData.game?.header()?.WhiteElo}`
                }
              </strong>
            </div>
          )
          : null
        }
        <Chessboard
          position={boardPosition}
          boardWidth={500}
          showNotation={false}
          boardOrientation={orientation}
          onPieceDrop={(from, to) => {
            const isLegal = handlePositionChange(from, to);
            return isLegal;
          }}
        />
        {
          gameData.game?.header()?.White
          ? (
            <div>
              <strong>
                {
                  orientation === 'white'
                    ? `${gameData.game?.header()?.White}: ${gameData.game?.header()?.WhiteElo}`
                    : `${gameData.game?.header()?.Black}: ${gameData.game?.header()?.BlackElo}`
                }
              </strong>
            </div>
          )
          : null
        }
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <button
            onClick={handleReset}
            disabled={!gameData.game?.history().length || !gameData.game}
            style={{
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            ⏮️
          </button>
          <button
            onClick={handlePreviousMove}
            disabled={currentMoveIndex === 0 || !gameData.game}
            style={{
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            ⏪
          </button>
          <button
            onClick={handlePlayPause}
            style={{ fontSize: '24px', cursor: 'pointer' }}
          >
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button
            onClick={handleNextMove}
            disabled={currentMoveIndex >= gameData.game?.history().length || !gameData.game}
            style={{
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            ⏩
          </button>
          <button
            onClick={() =>
              setOrientation((prevOrientation) =>
                prevOrientation === 'white' ? 'black' : 'white'
              )
            }
            style={{ fontSize: '24px', cursor: 'pointer', marginLeft: '20px' }}
          >
            🔄
          </button>
        </div>
        <EvalGraph evals={evals} history={gameData?.game?.history({ verbose: true }) || []} />
        <div style={{ display: 'flex', gap: '10px', maxWidth: '100px' }}>
          Speed&nbsp;
          <input
            id="speed-current-game"
            name="speed-current-game"
            type="range"
            value={speed}
            min="0.5"
            max="5"
            step="0.5"
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
          <label htmlFor="speed-current-game">{speed}s</label>
        </div>
      </div>
      <div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            minWidth: '300px',
          }}
        >
          <strong>Moves</strong>
          <hr />
          {renderMoveList()}
        </div>
      </div>
    </div>
  );
};

export default CurrentGame;
