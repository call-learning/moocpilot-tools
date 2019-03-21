import 'babel-polyfill';
import { getCourseIDFromURL, getGradeReportsFromLocalFolder } from './edxreportutils';

test('Transform current URL into courseid', () => {
  const url = new URL('http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/1b11844263a44ff8bb2ed9ebbb9847bc/');
  const courseid = getCourseIDFromURL(url);
  expect(courseid).toBe('course-v1:edX+DemoX+Demo_Course');
});

test('Read a report list from given URL/folder', async () => {
  // We normally accept an URL for the url of the file but
  // if we set the field filestream, then it will take over
  const reportlistpromise = await getGradeReportsFromLocalFolder('./tests/sampledata/gradereports/');
  expect(reportlistpromise.length).toBe(13);
  expect(reportlistpromise[0].name).toBe('anonymised-MinesTelecom_04003_session07_grade_report_2018-09-17-2117.csv');
});
