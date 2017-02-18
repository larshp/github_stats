let http = require("https");
let fs = require("fs");

let owner = "";
let token = "";

function mkdirSync(path) {
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
  console.log("Problem with request: " + e.message);
}

function receive(res, callback) {
  let result = "";
  res.setEncoding("utf8");
  res.on("data", (chunk) => {
    result = result + chunk;
  });
  res.on("end", () => {
    callback(JSON.parse(result));
  });
}

function callAPI(path, callback) {
  var options = {
    host: "api.github.com",
    path: path,
    port: "443",
    headers: {
      "User-Agent": "github_stats",
      "Authorization": "token " + token,
    }
  };
  var req = http.request(options, (res) => { receive(res, callback); });
  req.on("error", errorCallback);
  req.write("");
  req.end();
}

function saveFile(file, repoName, data) {
  let dir = "stats/" + repoName + "/";
  mkdirSync(dir);
  let fileName = dir + file + "_" + getDate() + ".json";
  fs.writeFileSync(fileName, JSON.stringify(data, false, 2));
}

// https://developer.github.com/v3/repos/traffic/
function getTraffic(repoName) {
  callAPI("/repos/" + owner + "/" + repoName + "/traffic/popular/referrers",
          (res) => {saveFile("referrers", repoName, res); });
  callAPI("/repos/" + owner + "/" + repoName + "/traffic/popular/paths",
          (res) => {saveFile("paths", repoName, res); });
  callAPI("/repos/" + owner + "/" + repoName + "/traffic/views",
          (res) => {saveFile("views", repoName, res); });
  callAPI("/repos/" + owner + "/" + repoName + "/traffic/clones",
          (res) => {saveFile("clones", repoName, res); });
}

function handleRepository(repo) {
  if(repo.fork === true) {
    return;
  }
  saveFile("repo", repo.name, repo);
  getTraffic(repo.name);
}

function repositoryListResponse(repos) {
  if(repos.message) {
    console.log(repos.message);
  } else {
    console.log(repos.length + " public repositories");
    repos.forEach(handleRepository);
  }
}

function repositoryList() {
  callAPI("/users/" + owner + "/repos?per_page=100", repositoryListResponse);
}

function run() {
  if(process.argv.length === 4) {
    owner = process.argv[2];
    console.log("Username:\t" + owner);
    token = process.argv[3];
    console.log("Token:\t\t" + token);

    mkdirSync("stats");
    repositoryList();
  } else {
    console.log("supply username and token");
  }
}

run();