#!/usr/bin/env node
import glob from 'glob';
import path from 'path';
import fs from 'fs';
import program from 'commander';


import pkg from '../../package.json';
import { parseGradeReports } from '../utils/parseutils';

program.version(pkg.version)
  .description('CLI Command to parse a set of reports and convert it into json to be processed by D3')
  .option('-g, --grade-dir <value>', 'specify the folder in which the downloaded grade reports are located', 'tests/sampledata/gradereports')
  .option('-o, --outputfile <value>', 'specify json output file', '')
  .parse(process.argv);


glob(path.join(program.gradeDir, '/*.csv'), {}, (er, files) => {
  const reportslist = files.map(fpath => ({
    filestream: fs.createReadStream(fpath),
    name: path.basename(fpath),
  }));

  parseGradeReports(reportslist).then((grades) => {
    if (program.outputfile) {
      const outfile = fs.createWriteStream(program.outputfile);
      outfile.write(JSON.stringify(grades), 'utf-8');
      outfile.end();
    } else { // Output to standard output
      console.log(JSON.stringify(grades));
    }
  });
});
