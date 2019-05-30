/**
 * Tools to manage CSV reports and transform them into a json parsable format
 * Parse one line of a CSV File
 *
 */

// See https://www.papaparse.com/  for more info
import Papa from 'papaparse';


// Default cohort name
const DEFAULT_COHORT = { id: 0, name: 'Default' };
/**
 *  Parse one line of a CSV File
 * @param currentcollectionid : the current collection identifier
 * @param rowdata: current row data in the form of { "COLHEADER": "DATA OR GRADE", ...}
 * @param currentdata the current data/database:
 *  collections: all collections as an array (a collection is
 *  {id: currentcollectionid, collectiontime: <datetime>,*      filename: <filename>}
 *  students: all students as an array (a collection is {id: studentid, username: <edx username>,
 *      cohort: [cohortlist], firstactivecollection: <currentcollectionid or -1>}
 *  grades: all grades as an array
 *  (a collection is {id: gradeid:<>, studentid:<>, value:<>, cohort:<>, currentcollectionid:<> }
 * @collectionarray: an array containing all collections information
 * @studentsarray: an array containing all student information
 * @gradesarray: an array containing all grades
 * @activitiesarray: an array containing all activities
 *
 * @return the currentdata modified value
 */
export function parseCSVStep(currentcollectionid, rowdata, cdata, ngrow) {
  // TODO: depending on the version of edX it seems that we can have
  //  Student ID instead of id or Username instead of username
  const nonGradeRow = ngrow || ['id', 'username', 'Cohort Name', 'Enrollment Track',
    'Verification Status', 'Certificate Eligible', 'Certificate Delivered', 'Certificate Type',
    'Student ID', 'Username', 'Enrollment Status'];
  const currentdata = cdata || {
    collections: [],
    students: [],
    grades: [],
    activities: [],
    cohorts: [DEFAULT_COHORT],
  };
  // Step 1: add the student if it does not exist

  const currentcohortname = rowdata['Cohort Name'];

  // Add the new cohort if it does not exist
  let currentcohort = DEFAULT_COHORT;
  if (currentcohortname !== null && currentcohortname !== DEFAULT_COHORT.name) {
    const existingcohort = currentdata.cohorts.find(el => (el.name === currentcohortname));
    if (!existingcohort) {
      currentcohort = { id: currentdata.cohorts.length, name: currentcohortname };
      currentdata.cohorts.push(currentcohort);
    }
  }

  let student = currentdata.students.find(el => (el.id === rowdata.id || el.id === rowdata['Student ID']));
  if (student === undefined) {
    // TODO: depending on the version of edX it seems that we can have
    //  StudentID instead of id or Username instead of username
    student = {
      id: rowdata.id ? rowdata.id : rowdata['Student ID'],
      username: rowdata.username ? rowdata.username : rowdata.Username,
      cohorts: [currentcohort.id],
      firstactivecollection: -1, // This means we know the student is here but we will set the
      // the final value once the student will have done at least one exercise/activity
    };
    currentdata.students.push(student);
  }

  // Step 2: add the grade to the grade table/db (if it is greater than 0),
  // filtering out all unwanted columns

  Object.keys(rowdata).forEach((colname) => {
    if (!(nonGradeRow.includes(colname) || colname.includes('Avg'))) {
      // Colname is a grade as such, so we can add it to the table
      let activity = currentdata.activities.find(el => el.name === colname);
      if (activity === undefined) {
        activity = {
          id: currentdata.activities.length,
          name: colname,
        };
        currentdata.activities.push(activity);
      }

      const gradeRow = {
        id: currentdata.grades.length,
        studentid: student.id,
        activityid: activity.id,
        value: Number.parseFloat(rowdata[activity.name]),
        cohort: currentcohort.id,
        collectionid: currentcollectionid,
      };

      if (gradeRow.value > 0) { // Grade > 0 is the trigger to add
        // the grade information to the database.
        // We consider that a grade of 0 means that there was no attempt
        if (student.firstactivecollection < 0) {
          student.firstactivecollection = currentcollectionid; // This is the first time we notice
          // the student is active
          // Replace it in the array
          if (currentcohort && student.cohorts.indexOf(currentcohort.id) === -1) {
            student.cohorts.push(currentcohort.id);
          }
          currentdata.students = currentdata.students.map(s =>
            ((s.id === student.id) ? student : s));
        }
        currentdata.grades.push(gradeRow); // Only count grade which have a value greater than 0
      }
    }
  });
  return currentdata;
}

export function getCollectionFromFilename(fname) {
  const result = fname.match(/.*_grade_report_(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})\.csv/);
  result.shift();
  const [years, months, days, hours, minutes] = result;
  return {
    id: Number.parseInt(result.reduce((acc, curr) => (acc + curr.toString()), ''), 10),
    // id is concatenation of all numbers
    timestamp: Date.UTC(years, months - 1, days, hours, minutes),
    // Unix Timestamp, watch for months (0 based)
    filename: fname,
  };
}

/**
 * Parse a grade report and return a promise that will be resolved when all grades reports
 * will be parsed
 * @param reportslist
 * @returns {Promise<[any, any, any, any, any, any, any, any, any, any]>}
 */
export function parseGradeReports(reportslist) {
  let currentdata = {
    collections: [],
    students: [],
    grades: [],
    activities: [],
    cohorts: [DEFAULT_COHORT],
  };
  const promiselist = reportslist.map(reportdata => new Promise((resolve, reject) => {
    const currentcollection = getCollectionFromFilename(reportdata.name);
    currentdata.collections.push(currentcollection);
    Papa.parse(reportdata.url ? reportdata.url : reportdata.filestream, {
      download: true,
      header: true,
      dynamicTyping: true,
      step: (results) => {
        if (!results.errors.length && results.data.length) {
          currentdata = parseCSVStep(currentcollection.id, results.data[0], currentdata);
        }
      },
      complete: () => {
        resolve();
      },
      error: (error) => {
        reject(error);
      },
    });
  }));
  promiselist.push(new Promise(resolve => resolve(currentdata)));
  // Last promise will return all data
  return Promise.all(promiselist).then((gradedataarray) => {
    if (gradedataarray.length > 0) {
      return gradedataarray.pop();
    }
    return null;
  });
}

