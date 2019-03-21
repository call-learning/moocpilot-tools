## MOOC Pilot Utils

In this project you will find a couple of tools to build a UI for MOOC Pilot in an edX page.
Also you will find some CLI tools available in development mode.

This project is for now in a very early stage and will change frequently.

Aims:
- Be used as a tool to create analytics components from the grade report. So all utilities to parse CSV reports and transform them
- Provide command line so to transform CSV files and anonymize them for later use as a test dataset

## Node version

v11.3.0

## Startup

    npm install
   
Then build the shared library (umd) in the `dist` folder.
    
    npm run build
    

## Use the tool to parse CSV files to JSON

Launch the command:

    npm run processreports
    
Or

    npm run processreports -- --outputfile=output.json

## Integrate the parser into an edX page

We use the namespace window.moocpilottools:

```html
   <p>Add the content you want teachers to see on this page</p>
   <div id="root"></div>
   <script>global._babelPolyfill = false;</script>
   <script src="https://unpkg.com/react@16/umd/react.production.min.js" crossorigin></script>
   <script src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js" crossorigin></script>
   <script type="text/javascript" src="http://moocpilotv2-tools.local/moocpilot.tools.js"></script>
   <script type="text/javascript" src="http://moocpilotv2-analyticslib.local/analyticscomponents.js"></script>
   <script type="text/javascript">
       let curl = new URL(window.location.href);
     	let callback = (reportsdata) => {
         ReactDOM.render(
             React.createElement(analyticscomponents.MPCollectionChart, {
               grades: reportsdata.grades,
               students: reportsdata.students,
               collections: reportsdata.collections,
               activities: reportsdata.activities,
               caption: "Basic Generation Chart"
             }, null),
     		 document.getElementById('root')
   		);
     	};
       window.moocpilottools.listReportDownloads(curl.protocol + '//' + curl.host,
           window.moocpilottools.getCourseIDFromURL(window.location.href))
           .then(allreports => window.moocpilottools.parseGradeReports(allreports, callback));
   </script>
```



## Testing


TODO


# Performance

Use IndexDB to temporary store result
Abstract actions on the data collected

