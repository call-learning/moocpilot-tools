import fs from 'fs';
import { parseCSVStep, getCollectionFromFilename, parseGradeReports } from './parseutils';


test('transform filename into collection data', () => {
  const filename = 'anonymised-MinesTelecom_04003_session07_grade_report_2018-09-17-2117.csv';
  const col = getCollectionFromFilename(filename);
  expect(col.id).toBe(201809172117);
  expect(col.timestamp).toBe(1539811020000);
  expect(col.filename).toBe(filename);
});


test('Transform a row of data, old edX Format and new edX Format', () => {
  const filename = 'anonymised-MinesTelecom_04003_session07_grade_report_2018-09-17-2117.csv';
  const currentcollection = getCollectionFromFilename(filename);
  let currentdata = {
    collections: [currentcollection],
    students: [],
    grades: [],
    activities: [],
    cohorts: [],
  };
  const rowdataold = {
    id: 2461771,
    username: 'earnestinekoepp599807',
    grade: 0,
    'HW 01': 0,
    'HW 02': 0,
    'HW 03': 0,
    'HW 04': 0,
    'HW 05': 0,
    'HW 06': 0,
    'HW 07': 0,
    'HW 08': 0,
    'HW 09': 0,
    'HW 10': 0,
    'HW 11': 0,
    'HW 12': 0,
    'HW 13': 0,
    'HW 14': 0,
    'HW 15': 0.1,
    'HW 16': 0,
    'HW 17': 0,
    'HW 18': 0,
    'HW 19': 0,
    'HW 20': 0,
    'HW 21': 0,
    'HW 22': 0,
    'HW 23': 0,
    'HW 24': 0,
    'HW 25': 0,
    'HW 26': 0,
    'HW 27': 0,
    'HW Avg': 0,
    'Lab 01': 0,
    'Lab 02': 0.2,
    'Lab 03': 0,
    'Lab 04': 0,
    'Lab 05': 0,
    'Lab Avg': 0,
    Final: 0,
    'TD 01': 0,
    'TD 02': 0,
    'TD 03': 0,
    'TD 04': 0,
    'TD 05': 0,
    'TD Avg': 0,
    EP: 0,
    'Certificat 01': 0,
    'Certificat 02': 0,
    'Certificat 03': 0,
    'Certificat Avg': 0,
    'PPQ 01': 0,
    'PPQ 02': 0,
    'PPQ Avg': 0,
    'Cohort Name': 'Default Group',
    'Enrollment Track': 'honor',
    'Verification Status': 'N/A',
    'Certificate Eligible': 'N',
    'Certificate Delivered': 'N',
    'Certificate Type': 'N/A',
  };

  currentdata = parseCSVStep(currentcollection.id, rowdataold, currentdata);

  expect(currentdata.activities[1]).toMatchObject({ id: 1, name: 'HW 01' });
  expect(currentdata.activities.length).toBe(45);

  expect(currentdata.grades[0]).toMatchObject({
    id: 0,
    studentid: 2461771,
    activityid: 15,
    value: 0.1,
    cohort: 'Default Group',
    collectionid: 201809172117,
  });

  const rowdatanew = {
    'Student ID': 2461771,
    Username: 'earnestinekoepp599807',
    Grade: 0,
    'HW 01': 0,
    'HW 02': 0,
    'HW 03': 0,
    'HW 04': 0,
    'HW 05': 0,
    'HW 06': 0,
    'HW 07': 0,
    'HW 08': 0,
    'HW 09': 0,
    'HW 10': 0,
    'HW 11': 0,
    'HW 12': 0,
    'HW 13': 0,
    'HW 14': 0,
    'HW 15': 0.1,
    'HW 16': 0,
    'HW 17': 0,
    'HW 18': 0,
    'HW 19': 0,
    'HW 20': 0,
    'HW 21': 0,
    'HW 22': 0,
    'HW 23': 0,
    'HW 24': 0,
    'HW 25': 0,
    'HW 26': 0,
    'HW 27': 0,
    'HW Avg': 0,
    'Lab 01': 0,
    'Lab 02': 0.2,
    'Lab 03': 0,
    'Lab 04': 0,
    'Lab 05': 0,
    'Lab Avg': 0,
    Final: 0,
    'TD 01': 0,
    'TD 02': 0,
    'TD 03': 0,
    'TD 04': 0,
    'TD 05': 0,
    'TD Avg': 0,
    EP: 0,
    'Certificat 01': 0,
    'Certificat 02': 0,
    'Certificat 03': 0,
    'Certificat Avg': 0,
    'PPQ 01': 0,
    'PPQ 02': 0,
    'PPQ Avg': 0,
    'Cohort Name': 'Default Group',
    'Enrollment Track': 'honor',
    'Verification Status': 'N/A',
    'Certificate Eligible': 'N',
    'Certificate Delivered': 'N',
    'Certificate Type': 'N/A',
    'Enrollment Status': 'N/A',
  };
  // Reset the test
  currentdata = {
    collections: [currentcollection],
    students: [],
    grades: [],
    activities: [],
    cohorts: [],
  };
  currentdata = parseCSVStep(currentcollection.id, rowdatanew, currentdata);

  expect(currentdata.activities[1]).toMatchObject({ id: 1, name: 'HW 01' });
  expect(currentdata.activities.length).toBe(45);

  expect(currentdata.grades[0]).toMatchObject({
    id: 0,
    studentid: 2461771,
    activityid: 15,
    value: 0.1,
    cohort: 'Default Group',
    collectionid: 201809172117,
  });
});

test('Read a report from a given URL/folder and return an object', () => {
  // We normally accept an URL for the url of the file but if we set
  // the field filestream, then it will take over
  const reportlist = [
    {
      filestream: fs.createReadStream('./tests/sampledata/gradereports/anonymised-MinesTelecom_04003_session07_grade_report_2018-10-24-2100.csv'),
      name: 'anonymised-MinesTelecom_04003_session07_grade_report_2018-10-24-2100.csv',
    },
  ];
  return parseGradeReports(reportlist).then((allgrades) => {
    expect(allgrades).toHaveProperty('collections');
    expect(allgrades).toHaveProperty('students');
    expect(allgrades).toHaveProperty('grades');
    expect(allgrades).toHaveProperty('activities');
    expect(allgrades.students.length).toBeGreaterThan(1);
    expect(allgrades.grades.length).toBeGreaterThan(1);
  });
});
