#!/usr/bin/env node
/**
 * Just anonymise the CSV report so we can then redistribute them for testing
 */

import program from 'commander';
import glob from 'glob';
import fs from 'fs';
import casual from 'casual';
import path from 'path';
import stripBomStream from 'strip-bom-stream';

// See https://www.papaparse.com/  for more info
import Papa from 'papaparse';

import pkg from '../../package.json';

program.version(pkg.version)
  .description('CLI Command to parse a set of reports and convert it into json to be processed by D3')
  .option('-g, --grade-dir <value>', 'specify the folder in which the downloaded grade reports are located', 'tests/sampledata/gradereports')
  .parse(process.argv);

glob(path.join(program.gradeDir, '/*.csv'), {}, (er, files) => {
  const actualUsers = new Map();
  // Actual user list so we always replace the username with the generated username

  files.map(filename => new Promise((resolve, reject) => {
    const outfile = fs.createWriteStream(path.join(path.dirname(filename), `anonymised-${path.basename(filename)}`));

    Papa.parse(fs.createReadStream(filename).pipe(stripBomStream()), {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        for (let i = 0; i < results.data.length; i += 1) {
          const row = results.data[i];
          // Change/Anonymize username
          if (!actualUsers.has(row.id)) {
            actualUsers.set(
              row.id,
              casual.first_name.toLowerCase() +
              casual.last_name.toLowerCase() +
              casual.integer(0, 1000000).toString(),
            );
          }
          row.username = actualUsers.get(row.id);
          // eslint-disable-next-line no-param-reassign
          results.data[i] = row;
        }
        outfile.write(Papa.unparse(
          results,
          {
            quotes: false, // or array of booleans
            escapeChar: '"',
            delimiter: ',',
            header: true,
          },
        ));
        outfile.end();
      },
      error: (error) => {
        reject(error);
      },
    });
  }));
});
