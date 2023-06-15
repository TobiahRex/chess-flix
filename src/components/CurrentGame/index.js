import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { handleGetGameEvals } from '../../services';


const CurrentGame = (props) => {
  const { gameData, setTargetPosition } = props;
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [boardPosition, setBoardPosition] = useState('start');
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fetching, setFetching] = useState(false);
  const [evals, setEvals] = useState([]);
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
      const targetFen = move.before;
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

  const handleReset = useCallback(() => {
    setBoardPosition('start');
    setCurrentMoveIndex(0);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  }, []);

  const handleTargetMove = useCallback(
    (move) => {
      setCurrentMoveIndex(move.index - 1);
      const targetFen = move.after;
      setBoardPosition(targetFen);
      setTargetPosition(targetFen);
    },
    [setTargetPosition]
  );

  useEffect(() => {
    const getEvals = async (moves) => {
      setFetching(true);
      const evals = await handleGetGameEvals({
        fen: moves[0].before,
        moves: moves.map((move) => move.lan),
      })
      setEvals(evals?.evaluations || []);
      setFetching(false);
    };

    if (gameData.game?.history().length && !fetching) {
      getEvals(gameData.game?.history({ verbose: true }));
    }
    const targetFen = gameData.game?.history({ verbose: true })[0].before
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
              onClick={() => handleTargetMove(movePair[0])}
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
                onClick={() => handleTargetMove(movePair[1])}
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
  }, [currentMoveIndex, gameData.game, handleTargetMove]);

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
        <>
          <strong>Current Evaluation</strong>
          <strong
            style={{
              fontSize: '20px',
              color: evals.length ? (evals[currentMoveIndex] > 0 ? 'lawngreen' : 'red') : 'black',
            }}
          >
            {
              fetching
                ? '...'
                : (evals.length ? evals[currentMoveIndex] / 100 + ' ' : 0)
            }
          </strong>
        </>
        <Chessboard
          position={boardPosition}
          draggable={false}
          boardWidth={500}
          boardOrientation={boardOrientation}
        />
        <div>
          <button
            onClick={handlePreviousMove}
            disabled={currentMoveIndex === 0 || !gameData.game}
            style={{
              marginRight: '10px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            Previous
          </button>
          <button
            onClick={handleNextMove}
            disabled={currentMoveIndex >= gameData.game?.history().length || !gameData.game}
            style={{
              marginRight: '10px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            Next
          </button>
          <button
            onClick={handleReset}
            disabled={!gameData.game?.history().length || !gameData.game}
            style={{
              marginRight: '10px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
          <button
            onClick={handlePlayPause}
            style={{ fontSize: '16px', cursor: 'pointer' }}
          >
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button
            onClick={() =>
              setBoardOrientation((prevOrientation) =>
                prevOrientation === 'white' ? 'black' : 'white'
              )
            }
            style={{ fontSize: '16px', cursor: 'pointer' }}
          >
            🔄
          </button>
        </div>
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
