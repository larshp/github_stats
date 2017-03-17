"use strict";
const fs = require('fs');

process.argv = process.argv.splice(2);

let files = process.argv.map((e) => { return JSON.parse(fs.readFileSync(e, "utf8")); });

let uniques = [];

for(let i = 0; i< files.length; i++) {
  for(let j=0;j<files[i].views.length;j++) {
    let view = files[i].views[j];
    if(uniques[view.timestamp.substr(0,10)] && uniques[view.timestamp.substr(0,10)] < view.uniques) {
      uniques[view.timestamp.substr(0,10)] = view.uniques;
    } else if(!uniques[view.timestamp.substr(0,10)]) {
      uniques[view.timestamp.substr(0,10)] = view.uniques;
    }
  }
}

for (var key in uniques) {
  console.log("[new Date(\"" + key + "\")," + uniques[key] +"],");
}

// https://jsfiddle.net/api/post/library/pure/