const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const fileName = './data/test-data.csv';
const totalRows = 1000000; // Для начала 100к, можно поменять на 1000000
const stream = fs.createWriteStream(fileName);

console.log(`Generating ${totalRows} UUIDs...`);

stream.write('sessionId\n');

for (let i = 0; i < totalRows; i++) {
    stream.write(`${uuidv4()}\n`);

    if (i % 100000 === 0 && i !== 0) {
        console.log(`Progress: ${i} rows...`);
    }
}

stream.end(() => {
    console.log(`Finished! ${fileName} created.`);
});