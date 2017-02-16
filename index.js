let http = require("https");
let fs = require("fs");

// todo, command line option to change username
let owner = "larshp";

var mkdirSync = function(path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

function getDate() {
  var now = new Date();

  return now.getUTCFullYear().toString() +
         ("0" + (now.getUTCMonth()+1)).slice(-2) +
         ("0" + now.getUTCDate()).slice(-2);
}

function errorCallback(e) {
  console.log("problem with request: " + e.message);
};

function callAPI(path, callback) {
  var options = {
    host: "api.github.com",
    path: path,
    port: "443",
    headers: {"User-Agent": "github_stats"}
  };
  var req = http.request(options, callback);
  req.on("error", errorCallback);
  req.write("");
  req.end();
}

function saveFile() {

}

// https://developer.github.com/v3/repos/traffic/
function getTraffic(repoName) {
// todo
/*
  callAPI("/repos/" + owner + "/" + repoName + "/traffic/popular/referrers", saveFile("referrers"));
  callAPI("/repos/" + owner + "/" + repoName + "/traffic/popular/paths", saveFile("paths"));
  callAPI("/repos/" + owner + "/" + repoName + "/traffic/views", saveFile("views"));
  callAPI("/repos/" + owner + "/" + repoName + "/traffic/clones", saveFile("clones"));
*/
}

function handleRepository(repo) {
  if(repo.fork === true) {
    return;
  }
  let dir = "stats/" + repo.name + "/";
  mkdirSync(dir);
  let fileName = dir + "repo_" + getDate() + ".json";
  fs.writeFileSync(fileName, JSON.stringify(repo, false, 2));

  getTraffic(repo.name);
}

function repositoryListResponse(res) {
  let result = "";
  res.setEncoding("utf8");
  res.on("data", (chunk) => {
    result = result + chunk;
  });
  res.on("end", () => {
    let repos = JSON.parse(result);
    console.log(repos.length + " public repositories");
    repos.forEach(handleRepository);
  });
}

function repositoryList() {
  callAPI("/users/" + owner + "/repos?per_page=100", repositoryListResponse);
}

mkdirSync("stats");
repositoryList();