import React, { useEffect, useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';


const CurrentGame = (props) => {
  const {
    gameData,
    setTargetPosition,
    currentEval,
    getPositionEval,
  } = props;
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [boardPosition, setBoardPosition] = useState('start');

  const handleNextMove = () => {
    if (currentMoveIndex < gameData.game?.history().length) {
      const move = gameData.game?.history({ verbose: true })[currentMoveIndex];
      const targetFen = move.after;
      setCurrentMoveIndex(currentMoveIndex + 1);
      setBoardPosition(targetFen);
      setTargetPosition(targetFen);
      getPositionEval(targetFen);
    }
  };

  const handlePreviousMove = () => {
    if (currentMoveIndex > 0) {
      const move = gameData.game.history({ verbose: true })[currentMoveIndex - 1];
      setCurrentMoveIndex(currentMoveIndex - 1);
      const targetFen = move.after
      setBoardPosition(targetFen);
      setTargetPosition(targetFen);
      getPositionEval(targetFen);
    }
  };

  const handleTargetMove = (move) => {
    setCurrentMoveIndex(move.index);
    const targetFen = move.after
    setBoardPosition(targetFen);
    setTargetPosition(targetFen);
    getPositionEval(targetFen);
  };

  const handleReset = () => {
    setBoardPosition('start');
    setCurrentMoveIndex(0);
  };

  useEffect(() => {
    setBoardPosition('start');
    setCurrentMoveIndex(0);
  }, [gameData]);

  const renderMoveList = useCallback(() => {
    if (!gameData.game) return '';
    const gameMoves = gameData.game?.history({ verbose: true });
    const moveList = [];
    let movePair;
    for (let index = 0; index < gameMoves.length; index++) {
      const move = {
        ...gameMoves[index],
        index: index + 1,
      };
      if (index % 2 === 0) {
        movePair = [move];
      } else {
        movePair.push(move);
        moveList.push(movePair);
      }
    }

    // Render move list
    return (
      <ol style={{
        marginTop: '0px',
        overflow: 'scroll',
        maxHeight: '550px'
        }}>
        {moveList.map((movePair, index) => (
          <li
            key={index}
            style={{
              textAlign: 'left',
            }}
          >
            <button
            onClick={() => handleTargetMove(movePair[0])}
            style={{
              border: 'none',
              padding: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              background: 'none',
              fontWeight: movePair[0].index === currentMoveIndex ? 'bold' : 'normal',
            }}>
              {`${movePair[0].san}, `}
            </button>
            <button
            onClick={() => handleTargetMove(movePair[1])}
            style={{
              border: 'none',
              padding: 'none',
              marginRight: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              background: 'none',
              fontWeight: movePair[1].index === currentMoveIndex ? 'bold' : 'normal',
            }}
            >
              {movePair[1].san}
            </button>
          </li>
        ))}
      </ol>
    );
  }, [gameData, currentMoveIndex]);

  return (
    <div
      id="current-game"
      style={{
        display: 'flex',
        gap: '20px',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <>
          <strong>Current Evaluation</strong>
          <strong style={{
            fontSize: '20px',
            color: (currentEval > 0 ? 'green' : 'red'),
          }}>
            {currentEval / 100 + ' '}
          </strong>
        </>
        <Chessboard
          position={boardPosition}
          draggable={false}
          boardWidth={500}
        />
        <div>
          <button
            onClick={handlePreviousMove}
            disabled={currentMoveIndex === 0 || !gameData}
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
            disabled={currentMoveIndex >= gameData.game?.history().length || !gameData}
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
            disabled={!gameData.game?.history().length || !gameData}
            style={{
              marginRight: '10px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          minWidth: '300px',
        }}>
          <strong>Moves</strong>
          <hr />
          {renderMoveList()}
        </div>
      </div>
    </div>
  );
};

export default CurrentGame;
