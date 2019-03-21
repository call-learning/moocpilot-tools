module.exports = gradefilesparser;


const d3dsv = require('d3-dsv');
const path = require('path');
const fs = require('fs');
const stripBomStream = require('strip-bom-stream');

// See https://csv.js.org
const csv = require('csv');



function gradefilesparser(files, output, anonymize) {

    let result = {
        grades: [],
        collections: {},
        students: {}
    }
    const fileDateExtractor = new RegExp(/_(\d{4}-\d{2}-\d{2})-\d{4}/);

    // First Sort all files per date, so the index in the collection table are relative to the collection number (first date = week 1)
    files.sort((f1, f2) => {
        const filedate1 = fileDateExtractor.exec(path.basename(f1, '.csv'))[1];
        const filedate2 = fileDateExtractor.exec(path.basename(f2, '.csv'))[1];
        return Date(filedate1) > Date(filedate2);
    });

    const allfilesread = files.map(
        (filename,colindex) => new Promise((resolve) => {
            if (fs.existsSync(filename)) {
                let collectionInfo = {};
                collectionInfo.filename = path.basename(filename, '.csv');
                collectionInfo.filedate = fileDateExtractor.exec(collectionInfo.filename)[1];
                result.collections[colindex] = collectionInfo;
                const filereader = fs.createReadStream(filename);
                filereader.on('end',
                    () => resolve()
                );
                // Then read the file and process it
                filereader.pipe(stripBomStream()) // Always strip BOM as it will mess up the columns identifiers because of it
                    .pipe(csv.parse({delimiter: ',', columns: true}))
                    .pipe(csv.transform(
                        (row) => {
                            // Here we just use a side effect of the transofrmation where we can just add the data into the result and
                            // we will discard the result of the callback
                            if (!(row.id in result.students)) {
                                // Add a new student
                                result.students[row.id] = {
                                    username: row.username,
                                    id: row.id,
                                    cohort: row['Cohort Name']
                                };
                            }
                            const nonGradeRow = ['id', 'username', 'Cohort Name', 'Enrollment Track',
                                'Verification Status', 'Certificate Eligible', 'Certificate Delivered', 'Certificate Type'];
                            Object.keys(row).filter(key => !(nonGradeRow.includes(key) || key.includes('Avg')))
                                .forEach(
                                    (k) => {
                                        let gradeRow = {studentid: row.id, name: k, value: row[k], collectid: colindex};
                                        result.grades.push(gradeRow);
                                    }
                                );
                        }));
            }
        })
    );
    Promise.all(allfilesread). then(
        () => console.log(JSON.stringify(result))
    );

}