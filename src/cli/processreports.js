#!/usr/bin/env node
import program from 'commander';
import pkg from '../../package.json';
import { parseGradeReports } from '../utils/parseutils';
import { getGradeReportsFromLocalFolder } from '../utils/edxreportutils';
import fs from 'fs';

program.version(pkg.version)
  .description('CLI Command to parse a set of reports and convert it into json to be processed by D3')
  .option('-g, --grade-dir <value>', 'specify the folder in which the downloaded grade reports are located', 'tests/sampledata/gradereports')
  .option('-o, --outputfile <value>', 'specify json output file', '')
  .parse(process.argv);

getGradeReportsFromLocalFolder(program.gradeDir).then((collections) => {
  parseGradeReports(collections).then((grades) => {
    if (program.outputfile) {
      const outfile = fs.createWriteStream(program.outputfile);
      outfile.write(JSON.stringify(grades), 'utf-8');
      outfile.end();
    } else { // Output to standard output
      console.log(JSON.stringify(grades));
    }
  });
});
