let http = require("https");
let fs = require("fs");

var mkdirSync = function(path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

function handleRepository(repo) {
//  console.log(repo.name);
  mkdirSync("stats/" + repo.name);
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

var options = {
  host: "api.github.com",
  path: "/users/larshp/repos?per_page=100",
  port: "443",
  headers: {"User-Agent": "github_stats"}
};

var req = http.request(options, repositoryListResponse);

req.on("error", (e) => {
  console.log("problem with request: " + e.message);
});

mkdirSync("stats");
req.write("");
req.end();