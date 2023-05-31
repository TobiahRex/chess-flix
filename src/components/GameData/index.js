
export default function GameData({ gameData }) {
  if (!gameData) return null;

  return (
    <div id="game-data" style={{ display: 'flex', flexDirection: 'column' }}>
      {`${gameData.type === 'FEN' ? 'FEN' : 'PGN'}`}
      <textarea
        type="text"
        rows="15"
        columns="50"
        value={gameData.game?.pgn() || gameData.game?.fen()}
        readOnly
      />
    </div>
  );
}