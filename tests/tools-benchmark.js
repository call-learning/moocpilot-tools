// This is used for development only to compare performance between two versions of the same routine
import { getCourseIDFromURL, getGradeReportsFromLocalFolder } from '../src/utils/edxreportutils';
import { Benchmark } from 'benchmark';
import { getCollectionFromFilename, parseGradeReports } from '../src';

const suite = new Benchmark.Suite();

// add tests
suite.add('ParserTest', {
  defer: true,
  fn: (deferred) => {
    const collections = [
      getCollectionFromFilename(`file:///${process.cwd()}/tests/sampledata/gradereports/anonymised-MinesTelecom_04003_session07_grade_report_2018-10-24-2100.csv`),
    ];
    parseGradeReports(collections).then((allgrades) => {
      deferred.resolve();
    });
  },
})
  // add listeners
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log(`Fastest is ${this.filter('fastest').map('name')}`);
  })
  // run async
  .run({ async: true });
