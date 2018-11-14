const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');

app.use(cors());
app.use('/static/',express.static("Projects"));

app.get('/', function (req, res) {
 res.send('Hello World');
});

app.get('/save/:id/:project/:data', function (req, res) {
  const { id, project, data } = req.params;
  const dir = __dirname+"/Projects/"+project+"/subjects/";

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  fs.writeFile(dir+id+"/"+Date.now()+".json", JSON.stringify(JSON.parse(data), null, 4), (err) => {
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

app.listen(3001);
console.log("Server on: 3001");
