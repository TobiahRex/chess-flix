import React, { useEffect, useState } from 'react';
import { getArchives, getGames } from '../../services/getChessData';
import { Chess } from 'chess.js';

const ChessData = ({ setCurrentGame }) => {
  const [archives, setArchiveLinks] = useState([]);
  const [archiveLink, setArchiveLink] = useState('');
  const [fetching, setFetching] = useState(false);
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        setFetching(true);
        const archives = await getArchives();
        setFetching(false);
        setArchiveLinks(archives.reverse());
      } catch (error) {
        console.error('Error fetching archives:', error);
      }
    };
    fetchArchives();
  }, []);

  const handleGetGames = async () => {
    if (!archiveLink) return;
    try {
      setFetching(true);
      const games = await getGames(archiveLink);
      setGames(games);
      setFetching(false);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleUpdateGame = (pgn) => {
    const chess = new Chess();
    chess.loadPgn(pgn);
    setCurrentGame(chess);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Chess Data</h1>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="year-select">Select Month:&nbsp;</label>
        <select id="year-select" value={archiveLink} onChange={(e) => setArchiveLink(e.target.value)}>
          <option value="">-- Select Year --</option>
          {archives.map((link) => (
            <option key={link} value={link}>
              {
                link
                  .split('/')
                  .slice(-2)
                  .reduce((yr, mon) => {
                    const dateArray = [yr, mon];
                    const year = parseInt(dateArray[0]);
                    const month = parseInt(dateArray[1]);

                    const formattedDate = new Date(year, month - 1).toLocaleString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    });
                    return formattedDate
                  })
              }
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleGetGames}
        disabled={!archiveLink || fetching}
        style={{ width: '150px', height: '40px', fontSize: '20px' }}
      >
        {!fetching ? 'Get Games' : 'Loading...'}
      </button>
      {
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            overflowY: 'scroll',
            maxHeight: '400px',
            marginTop: '50px'
          }}>
          {
            games.map((game, i) => {
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '75%',
                    gap: '10px',
                    borderBottom: '1px solid grey',
                    padding: '10px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <img src={game.white.avatar} style={{ maxWidth: '100px', borderRadius: '10px' }} />
                      <span>{game.white.username}</span>
                      <span>{game.white.rating}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <img src={game.black.avatar} style={{ maxWidth: '100px', borderRadius: '10px' }} />
                      <span>{game.black.username}</span>
                      <span>{game.black.rating}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ color: game.result === 'win' ? 'lawngreen' : 'red' }}>Result: {game.result}</span>
                    <span>Time Control: {game.time_control}</span>
                    <span>End Time: {game.end_time}</span>
                    <span>Game Type: {game.time_class}</span>
                    <button
                      onClick={() => handleUpdateGame(game.pgn)}
                    >
                      Copy PGN
                    </button>
                    <a href={game.url} target="_blank" rel="noreferrer">Game Link</a>
                  </div>
                </div>
              )
            })
          }
        </div>
      }
    </div>
  );
};

export default ChessData;
