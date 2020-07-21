// server.js
import bodyParser from 'body-parser';
import logger from 'morgan';

// create our instances
const dotenv = require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const server = require('http').createServer(app)
const {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues
} = require('./googleSheetsService.js');


// set port to either a predetermined port number if you have set it up, or 3000
const API_PORT = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: "penncoursesearch" }));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'client/build')));


//mappings sent to client for searching
var courses = {}
var documents = {}
var idf = {}

async function loadCourses() {

  return new Promise(async function (resolve, reject) {
    console.time("Server Load Courses");
    const spreadsheetId = process.env.SHEET_ID;
    const sheetName = process.env.SHEET_NAME;

    console.log("fetching courses")
    try {
      const auth = await getAuthToken();
      const response = await getSpreadSheetValues({
        spreadsheetId,
        sheetName,
        auth
      })

      //populate courses into tries for autocomplete
      response.data.values.forEach(function (item, index) {
        if (index === 0) return

        let code = item[0] + item[1];
        let course = { prefix: item[0], number: item[1], title: item[2], prefixTitle: item[3], description: JSON.parse(item[4]) }
        courses[code] = course

        //---START TF-IDF Calculations
        //TF(t) = (Number of times term t appears in a document) / (Total number of terms in the document).
        //IDF(t) = log_e(Total number of documents / Number of documents with term t in it).
        //documents[document][term] = (Number of times term t appears in a document)
        documents[code] = {}
        item[4].toUpperCase().split(/\W+/).forEach((description_word, index) => {
          if (!(description_word in documents[code])) {
            documents[code][description_word] = 1

            if (!(description_word in idf)) {
              idf[description_word] = 1
            } else {
              idf[description_word] = idf[description_word] + 1
            }

          } else {
            documents[code][description_word] = documents[code][description_word] + 1
          }
        })
        //---END TF-IDF Calculations

      });
    } catch (error) {
      console.log(error.message, error.stack);
      reject()
    }
    console.timeEnd("Server Load Courses");
    resolve(courses)
  })
}

app.get('/api/courses', async (req, res, next) => {
  console.time("/api/courses");
  res.json(courses)
  console.timeEnd("/api/courses");
});

app.get('/api/idf', async (req, res, next) => {
  console.time("/api/idf");
  res.json({ success: true, documents: documents, idf: idf })
  console.timeEnd("/api/idf");
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/public', 'index.html'));
  });
}

//load courses before starting up the server
async function main() {
  courses = await loadCourses()
  server.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
}

main()
