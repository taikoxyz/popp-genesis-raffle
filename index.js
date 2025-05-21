const fs = require('fs');
const axios = require('axios');

async function fetchUniqueRandomIndices(count, min, max) {
  const indices = new Set();

  while (indices.size < count) {
    const needed = count - indices.size;
    const url = `https://www.random.org/integers/?num=${needed}&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;

    const response = await axios.get(url);
   
    if (!Number.isNaN(response.data)){
      indices.add(response.data);
      continue;      
    }
    const numbers = response.data.split('\n')

    numbers.forEach(n => indices.add(n));
  }

  return Array.from(indices);
}

async function getRandomWinnersFrom(filePath, numWinners){
  try {
    console.log(`📜 Randomly selecting ${numWinners} from ${filePath}`);
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
    const addresses = lines.map(line => line.split(',')[0].trim());

    if (addresses.length < numWinners + 1) {
      throw new Error('Not enough addresses to select winners.');
    }

    const winnerIndices = await fetchUniqueRandomIndices(numWinners, 0, addresses.length - 1);
    
    const winners = winnerIndices.map(index => addresses[index]);

    const outputFile = filePath.replace('.csv', '_winners.json');

    fs.writeFileSync(outputFile, JSON.stringify(winners, null, 2));
    console.log(`🎉 Winners ${winners.join(', ')} saved to ${outputFile}`);

  } catch (err) {
    console.error('Error:', err);
  }
}

async function main(){
  await getRandomWinnersFrom('bridge-swap-participants.csv', 1);
  await getRandomWinnersFrom('pheasant-swap-participants.csv', 1);
}

main()