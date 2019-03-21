#!/usr/bin/env node

const program = require('commander');
const glob = require('glob');
const path = require('path');
const pkg  = require( '../package.json');
const gfparser  = require( './gradefilesparser');

program.version(pkg.version)
  .description('CLI Command to parse a set of reports and convert it into json to be processed by D3')
  .option('-g, --grade-dir <value>', 'specify the folder in which the downloaded grade reports are located','tests/sampledata/gradereports')
  .option('-o, --outputfile <value>', 'specify json output file','versionLoaded.json')
  .option('-a, --anonymize', 'specify a branch to clone')
  .parse(process.argv);


glob(path.join(program.gradeDir,'/*.csv'), {}, (er, files) => {
    gfparser(files, program.outputfile);
});