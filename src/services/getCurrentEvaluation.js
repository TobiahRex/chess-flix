export default async function handleGetCurrentEval(requestBody) {
  try {
    const response = await fetch('http://127.0.0.1:5000/position-eval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      mode: 'cors',
    });
    if (!response.ok) {
      const err = Error('Network response was not ok');
      err.response = response;
      throw err;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current evaluation:', error);
    return { evaluation: 0 }
  }
};