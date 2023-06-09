export default async function handleGetPreviews(requestBody) {
  const response = await fetch('http://127.0.0.1:5000/previews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    const err = Error('Network response was not ok');
    err.response = response;
    throw err;
  }
  try {
    const data = await response.json();
    if (data.error) {
      alert(data.error);
      console.error(data.error)
      return { previews: [] };
    }
    return data;
  } catch (err) {
    console.log(err);
  }
};