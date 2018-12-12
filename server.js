const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const config = require('./src/config');

app.use(cors());
app.use('/static/',express.static("Projects"));

app.get('/', function (req, res) {
  console.log("")
 res.send('Hello World');
});

app.get('/save/:id/:project/:data', function (req, res) {
  const { id, project, data } = req.params;
  const dir = __dirname+"/Projects/"+project+"/subjects/";

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  let today = new Date();
  let sec = today.getSeconds();
  let min = today.getMinutes();
  let hh = today.getHours();
  let dd = today.getDate();
  let mm = today.getMonth()+1;
  let yyyy = today.getFullYear();

  min = (min<10)?'0'+min:min;
  sec = (sec<10)?'0'+sec:sec;
  dd = (dd<10)?'0'+dd:dd;
  mm = (mm<10)?'0'+mm:mm;

  today = ""+ yyyy + mm + dd + '_' + hh + min + sec;

  fs.writeFile(dir+id+"/"+today+".json", JSON.stringify(JSON.parse(data), null, 4), (err) => {
    if (err) throw err;
    res.json({
      success: true
    });
  });
});


app.get('/temp/:id/:project/:data', function (req, res) {
  const { id, project, data } = req.params;
  const dir = __dirname+"/Projects/"+project+"/subjects/";

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  fs.writeFile(dir+id+"/temp.json", JSON.stringify(JSON.parse(data), null, 4), (err) => {
    if (err) throw err;
    res.json({
      success: true
    });
  });
});

app.get('/study/:id/:project', function (req, res) {
  const { id, project } = req.params;
  const dir = __dirname+"/Projects/"+project+"/subjects/"+id+"/";
  fs.readdir(dir, function(err, items) {
    if(items) {
      fs.readdir(__dirname+"/Projects/"+project+"/img", function(err, items) {
        if(items) {
          fs.readFile(dir+"study.json", 'utf8', function(err, contents) {
              res.json({
                success: true,
                message: "Ok!",
                urls: items,
                config: JSON.parse(contents),
              });
          });
        } else {
          res.json({
            success: false,
            message: "There are no designs in this experiment!",
          });
        }
      });
    } else {
      res.json({
        success: false,
        message: "Project or user doesn't exists!",
      });
    }
  });
});

app.listen(config.port);
console.log("Server on: " + config.port);
