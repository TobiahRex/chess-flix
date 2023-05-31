import React, { useState } from 'react';

const MOCK_PGN = `[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "?"]
[Black "?"]
[Result "*"]

1. c4 e5 2. Nc3 Nf6 3. g3 Bb4 4. Qb3 Nc6 5. Bg2 Nd4 6. Qa4 a5 7. e3 Nc6 8. Nf3
O-O 9. Nd5 Bd6 10. a3 Nxd5 11. cxd5 Ne7 12. e4 f5 13. d3 fxe4 14. dxe4 Kh8 15.
O-O Ng8 16. Bg5 Qe8 17. Nh4 Bc5 18. b4 Bb6 19. Qb3 axb4 20. Qxb4 d6 21. a4 Qh5
22. a5 Bd4 23. Bd2 Bxa1 24. Rxa1 b6 *`;

const MOCK_FEN = "r1b2rnk/2p3pp/1p1p4/P2Pp2q/1Q2P2N/6P1/3B1PBP/R5K1 w - - 0 25";

const GameSubmission = ({ handleGameSubmission }) => {
  const [text, setText] = useState(MOCK_PGN);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleGameSubmission(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <textarea
        type="text"
        placeholder="Enter PGN or FEN"
        value={text}
        rows="15"
        columns="50"
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default GameSubmission;
