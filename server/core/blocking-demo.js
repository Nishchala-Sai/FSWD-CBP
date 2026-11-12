// Blocking vs non-blocking I/O. Run with: npm run demo:blocking
const fs = require('fs');

console.log('1. Start');

// Blocking: the program waits here until the whole file is read
const text = fs.readFileSync(__filename, 'utf8');
console.log(`2. readFileSync finished (${text.length} chars) - nothing else could run meanwhile`);

// Non-blocking: Node starts the read, keeps going, and runs the callback later
fs.readFile(__filename, 'utf8', (err, data) => {
  console.log(`4. readFile callback ran (${data.length} chars) - after the line below`);
});

console.log('3. End of script reached while readFile is still in progress');
