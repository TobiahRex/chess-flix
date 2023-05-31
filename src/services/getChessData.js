export async function getGames(archiveUrl) {
  try {
    const response = await fetch(archiveUrl, { method: 'GET' });
    if (!response.ok) {
      const err = Error('Network response was not ok');
      err.response = response;
      throw err;
    }
    const data = await response.json();
    const myGames = [];
    if (data) {
      for (let game of data.games) {
        const isWhite = game.white.username.toLowerCase() === 'tobiahsrex';
        const myWin = isWhite
          ? game.white.result === 'win'
          : game.black.result === 'win';
        const metaData = game.pgn.split('\n');
        const date = metaData.find(line => line.startsWith('[Date')).substring(7, 17);
        const startTime = metaData.find(line => line.startsWith('[StartTime')).substring(12, 20);
        const endTime = metaData.find(line => line.startsWith('[EndTime')).substring(10, 18);
        const { start_time, end_time } = parseTime(startTime, endTime, date);
        const opponentProfile = await getProfile(isWhite ? game.black['@id'] : game.white['@id']);
        const template = {
          'username': 'tobiahsrex',
          'avatar': 'https://images.chesscomfiles.com/uploads/v1/user/92675886.c4235591.200x200o.d93954e125ad.jpeg',
          'name': 'Tobiah Rex',
          'url': 'https://www.chess.com/member/TobiahsRex',
          'location': 'San Francisco, CA',
        }
        const result = {
          'white': {
            ...game.white,
            avatar: isWhite ? template.avatar : opponentProfile.avatar,
          },
          'black': {
            ...game.black,
            avatar: isWhite ? opponentProfile.avatar : template.avatar,
          },
          'time_class': game.time_class,
          'time_control': `${Number(game.time_control) / 60} min`,
          'start_time': start_time,
          'end_time': end_time,
          'my_color': isWhite ? 'white' : 'black',
          'my_rating': isWhite ? game.white.rating : game.black.rating,
          'result': myWin ? 'win' : !myWin ? 'loss' : 'draw',
          'link': game.url,
          'pgn': game.pgn,
          'url': game.url,
        }
        myGames.push(result);
      }
    }
    return myGames;
  } catch (error) {
    console.error('Error fetching games:', error);
  }
};

function parseTime(start_time, end_time, date) {
  // Convert start_time, end_time, and date to Date objects and combine into a Date with PST timezone
  const start = new Date(`${date} ${start_time}`);
  const end = new Date(`${date} ${end_time}`);
  const dt_pst = new Date(start.getFullYear(), start.getMonth(), start.getDate(), end.getHours(), end.getMinutes(), end.getSeconds());
  dt_pst.setHours(dt_pst.getHours() - 8); // Offset for PST timezone

  // Format end_time
  end_time = dt_pst.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

  // Calculate start_time based on duration
  const duration = end.getTime() - start.getTime();
  const start_dt = new Date(dt_pst.getTime() - duration);
  start_time = start_dt.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

  return { start_time, end_time };
}


export async function getArchives() {
  try {
    const response = await fetch('https://api.chess.com/pub/player/tobiahsrex/games/archives', { method: 'GET' });
    if (!response.ok) {
      const err = Error('Network response was not ok');
      err.response = response;
      throw err;
    } else {
      const data = await response.json();
      return data.archives;
    }
  } catch (error) {
    console.error('Error fetching archives:', error);
  }
}

export async function getProfile(profileUrl) {
  try {
    const response = await fetch(profileUrl, { method: 'GET' });
    if (!response.ok) {
      const err = Error('Network response was not ok');
      err.response = response;
      throw err;
    } else {
      const data = await response.json();
      return ({
        'username': data.username,
        'avatar': data.avatar || 'https://e7.pngegg.com/pngimages/980/304/png-clipart-computer-icons-user-profile-avatar-heroes-silhouette-thumbnail.png',
        'name': data.name,
        'url': data.url,
        'location': data.location,
      });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}