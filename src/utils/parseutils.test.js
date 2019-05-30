import fs from 'fs';
import { parseCSVStep, getCollectionFromFilename, parseGradeReports } from './parseutils';

test('transform filename into collection data', () => {
  const filename = 'anonymised-MinesTelecom_04003_session07_grade_report_2018-09-17-2117.csv';
  const col = getCollectionFromFilename(filename);
  expect(col.id).toBe(201809172117);
  expect(col.timestamp).toBe(1537219020000);
  expect(col.filename).toBe(filename);
});

test('Transform a row of data, old edX Format', () => {
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
    'HW 01': 1,
    'HW 02': 0,
    'HW 03': 0,
    'HW 04': 0,
    'HW 05': 0,
    'HW 06': 0,
    'HW 07': 0,
    'HW 08': 0,
    'HW 09': 0,
    'HW 10': 0,
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
  expect(currentdata.activities.length).toBe(23);

  expect(currentdata.grades[0]).toMatchObject({
    id: 0,
    studentid: 2461771,
    activityid: 1,
    value: 1,
    cohort: 0,
    collectionid: 201809172117,
  });
});

test('Transform a row of data, new edX Format', () => {
  const filename = 'anonymised-MinesTelecom_04003_session07_grade_report_2018-09-17-2117.csv';
  const currentcollection = getCollectionFromFilename(filename);
  let currentdata = {
    collections: [currentcollection],
    students: [],
    grades: [],
    activities: [],
    cohorts: [],
  };

  const rowdatanew = {
    'Student ID': 2461771,
    Username: 'earnestinekoepp599807',
    Grade: 0,
    'HW 01': 1,
    'HW 02': 0,
    'HW 03': 0,
    'HW 04': 0,
    'HW 05': 0,
    'HW 06': 0,
    'HW 07': 0,
    'HW 08': 0,
    'HW 09': 0,
    'HW 10': 0,
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
  expect(currentdata.activities.length).toBe(23);

  expect(currentdata.grades[0]).toMatchObject({
    id: 0,
    studentid: 2461771,
    activityid: 1,
    value: 1,
    cohort: 0,
    collectionid: 201809172117,
  });
});

test('Check cohort transformation', () => {
  const filename = 'anonymised-MinesTelecom_04003_session07_grade_report_2018-09-17-2117.csv';
  const currentcollection = getCollectionFromFilename(filename);
  const rowdataold = {
    id: 2461771,
    username: 'earnestinekoepp599807',
    grade: 0,
    'HW 01': 0,
    'HW 02': 0,
    'PPQ Avg': 0,
    'Cohort Name': 'PRO',
    'Enrollment Track': 'honor',
    'Verification Status': 'N/A',
    'Certificate Eligible': 'N',
    'Certificate Delivered': 'N',
    'Certificate Type': 'N/A',
  };

  const currentdata = parseCSVStep(currentcollection.id, rowdataold, null);

  expect(currentdata.activities[1]).toMatchObject({ id: 1, name: 'HW 01' });
  expect(currentdata.cohorts.length).toBe(2);

  expect(currentdata.cohorts[0]).toMatchObject({
    id: 0,
    name: 'Default',
  });
  expect(currentdata.cohorts[1]).toMatchObject({
    id: 1,
    name: 'PRO',
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
