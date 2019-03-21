#!/usr/bin/env node
/**
 * Just anonymise the CSV report so we can then redistribute them for testing
 */
const program = require('commander');
const glob = require('glob');
const fs = require('fs');
const pkg = require('../package.json');
var casual = require('casual');
const stripBomStream = require('strip-bom-stream');
const path = require('path');

// See https://csv.js.org
const csv = require('csv');


program.version(pkg.version)
    .description('CLI Command to parse a set of reports and convert it into json to be processed by D3')
    .option('-g, --grade-dir <value>', 'specify the folder in which the downloaded grade reports are located', 'tests/sampledata/gradereports')
    .parse(process.argv);


glob(path.join(program.gradeDir, '/*.csv'), {}, (er, files) => {
    let actualUsers = new Map(); // Actual user list so we always replace the username with the generated username
    files.forEach(
        (f) => {
            const outfile = fs.createWriteStream(path.join(path.dirname(f), 'anonymised-' + path.basename(f)));
            fs.createReadStream(f)
                .pipe(stripBomStream()) // Always strip BOM as it will mess up the columns identifiers because of it
                .pipe(csv.parse({delimiter: ',', columns: true})).pipe(csv.transform(
                (r) => {
                    // Change/Anonymize username
                    if (!actualUsers.has(r.id)) {
                        actualUsers.set(r.id, casual.first_name.toLowerCase() + casual.last_name.toLowerCase() + casual.integer(0, 1000000).toString());
                    }
                    r.username = actualUsers.get(r.id);
                    return r;
                }, {parallel: 1})) // Here the transformation is sequential so we avoid switching rows
                .pipe(csv.stringify({header: true}))
                .pipe(outfile);
        });

});