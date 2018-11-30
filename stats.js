const fs = require('fs');

const project = process.argv[2];
const id = process.argv[3];

const dir = __dirname+"/Projects/"+project+"/subjects/"+id+"/";

fs.readdir(dir, function(err, items) {
  if(err) console.log(err);

  fs.readFile(dir+'study.json', 'utf8', function(err, contents) {
    if(err) console.log(err);

    const { schedule, designs } = JSON.parse(contents);

    fs.readFile(dir+items[items.length-3], 'utf8', function(err, contents) {
      if(err) console.log(err);

      const results = JSON.parse(contents);
      results.shift();
      let i;

      for(let key in schedule) {
        let avg = 0;
        for(i=key*schedule[key].length; i<(parseInt(key)+1)*schedule[key].length; i++) avg+=results[i].time;
        avg/=schedule[key].length;
        console.log(designs[key] + ": " + avg);
      }
    });
  });
});
