// server.js
import bodyParser from 'body-parser';
import logger from 'morgan';
import Trie from '../client/build/static/trie.js';

// create our instances
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues
} = require('./googleSheetsService.js');

// instantiate a mongoose connect call
console.log("node env: " + process.env.NODE_ENV)

// add routes
// var user = require('./server/routes/user')

// set our port to either a predetermined port number if you have set it up, or 3000
// now we should configure the API to use bodyParser and look for JSON data in the request body
// Serve the static files from the React app
const API_PORT = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: "penncoursesearch" }));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'client/build')));

/* Routes involving Users crud */
// app.use('/api/login', user.login);
var courseCodeTrie = new Trie()
var courseTitleTrie = new Trie()

var documents = {}
var idf = {}

async function loadCourses() {
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

      //trie to autcomplete on course code i.e. CIS121
      courseCodeTrie.addWord(code, course)
      courseCodeTrie.addWord(item[0] + " " + item[1], course)

      //trie to autocomplete on words in the title of course
      let items = item[2].toUpperCase().split(" ")
      if(item[0] === "CIS" && item[1] === "398"){
        console.log(items)
      }
      items.forEach((titleWord, index) => {
        courseTitleTrie.addWord(titleWord, course)
      })

      //---START TF-IDF Calculations
      //TF(t) = (Number of times term t appears in a document) / (Total number of terms in the document).
      //IDF(t) = log_e(Total number of documents / Number of documents with term t in it).
      //documents[document][term] = (Number of times term t appears in a document)
      documents[code] = {}
      item[4].toUpperCase().split(/\W+/).forEach((description_word, index) => {
        if (!(description_word in documents[code])){
          documents[code][description_word] = 1
          
          if (!(description_word in idf)){
            idf[description_word] = 1
          }else{
            idf[description_word] = idf[description_word] + 1
          }
          
        }else{
          documents[code][description_word] = documents[code][description_word] + 1
        }
      })
      //---END TF-IDF Calculations

    });
  } catch (error) {
    console.log(error.message, error.stack);
  }
  console.timeEnd("Server Load Courses");
}

// app.get('/api/courses', async (req, res, next) => {

//   if(courses.length !== 0){
//     console.log("sending already loaded courses")
//     res.json(courses)
//   }else{
//     console.log("fetching courses")
//     try {
//       const spreadsheetId = process.env.SHEET_ID;
//       const sheetName = process.env.SHEET_NAME;
//       const auth = await getAuthToken();
//       const response = await getSpreadSheetValues({
//         spreadsheetId,
//         sheetName,
//         auth
//       })

//       courses = response.data.values
//       res.json(courses)

//     } catch(error) {
//       console.log(error.message, error.stack);
//     }
//   }
// });

app.get('/api/courses', async (req, res, next) => {
  let tries = { success: true, courseCodeTrie: courseCodeTrie, courseTitleTrie: courseTitleTrie, documents: documents, idf: idf }
  res.json(JSON.stringify(tries))
});

app.get('/api/search', (req, res, next) => {
  console.time("Server Autocomplete");
  var word = req.query.word.toUpperCase();
  var results = []
  trie.predictWord(word).forEach(function (item, index) {
    let data = courses[item]
    data['id'] = item
    data['type'] = 'class'
    results.push(data)
  });
  res.json({ success: true, result: results })
  console.timeEnd("Server Autocomplete");
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
    res.sendFile(path.join(__dirname, 'client/src', 'index.html'));
  });
}

loadCourses()
server.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));