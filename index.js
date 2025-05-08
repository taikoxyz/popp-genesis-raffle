const fs = require('fs');
const axios = require('axios');

const FILE_PATH = 'participants.csv';
const WINNERS_OUTPUT = 'winners.json';
const MAJOR_WINNER_OUTPUT = 'major_winner.json';
const NUM_WINNERS = 150;

async function fetchUniqueRandomIndices(count, min, max) {
  const indices = new Set();

  while (indices.size < count) {
    const needed = count - indices.size;
    const url = `https://www.random.org/integers/?num=${needed}&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;

    const response = await axios.get(url);
    const numbers = response.data
      .trim()
      .split('\n')
      .map(n => parseInt(n, 10));

    numbers.forEach(n => indices.add(n));
  }

  return Array.from(indices);
}

async function fetchSingleRandomIndex(min, max) {
  const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;
  const response = await axios.get(url);
  return response.data
}

(async () => {
  try {
    const lines = fs.readFileSync(FILE_PATH, 'utf8').split('\n').filter(Boolean);
    const addresses = lines.map(line => line.split(',')[0].trim());

    if (addresses.length < NUM_WINNERS + 1) {
      throw new Error('Not enough addresses to select winners.');
    }

    const winnerIndices = await fetchUniqueRandomIndices(NUM_WINNERS, 0, addresses.length - 1);
    const winners = winnerIndices.map(index => addresses[index]);

    const majorWinnerIndex = await fetchSingleRandomIndex(0, addresses.length - 1);
    const majorWinner = addresses[majorWinnerIndex];


    fs.writeFileSync(WINNERS_OUTPUT, JSON.stringify(winners, null, 2));
    console.log(`🎉 Winners saved to ${WINNERS_OUTPUT}`);

    fs.writeFileSync(MAJOR_WINNER_OUTPUT, JSON.stringify({ majorWinner }, null, 2));
    console.log(`🏆 Major winner saved to ${MAJOR_WINNER_OUTPUT}`);

  } catch (err) {
    console.error('Error:', err);
  }
})();

