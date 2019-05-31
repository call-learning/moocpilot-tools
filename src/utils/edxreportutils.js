/**
 * Tools to edX Reports (List them and download them)
 * Parse one line of a CSV File
 *
 */
import axios from 'axios';
import glob from 'glob';
import path from 'path';
import { getCollectionFromFilename } from './parseutils';

/**
 * Get all reports as a json list through the course dashboard API
 * We assume that the cookie named csrftoken is set with the right credentials
 * We assume here that we are logged in the edX platform
 * @param baseurl
 * @param courseId
 * @return [{url: 'report1url', name:'reportfilename'}, ...]
 */
export async function getGradeReportsFromAPI(baseurl, courseId) {
  try {
    const finalurl = `${baseurl}/courses/${courseId}/instructor/api/list_report_downloads`;
    const response = await axios.post(
      finalurl.toString(),
      {},
      {
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFToken',
      },
    );
    if (response.status === 200) {
      const collections = response.data.downloads.map(dld => getCollectionFromFilename(dld.url));
      return collections.filter(c => c !== null);
    }
  } catch (error) {
    console.error(error);
  }
  return null;
}

export function getGradeReportsFromLocalFolder(filepath) {
  return new Promise((resolve) => {
    glob(
      path.join(filepath, '*.csv'),
      { absolute: true },
      (err, matches) => resolve(matches.map(fpath => getCollectionFromFilename(`file:///${fpath}`))),
    );
  });
}

/**
 * Guess current course id from a given URL
 * @param url an URL in the form of URL class (see javascript URL: https://developer.mozilla.org/fr/docs/Web/API/URL)
 * @return {any}
 */
export function getCourseIDFromURL(url) {
  const result = url.toString().match(/.*courses\/(course-v1:\w+\+\w+\+\w+)\//);
  return result.length > 1 ? result[1] : null;
}
