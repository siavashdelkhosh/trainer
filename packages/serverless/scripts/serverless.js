const fs = require("fs");
const path = require("path");
const YAML = require("js-yaml");

const files = [path.join(__dirname, "serverless/workout.yml")];

const concatServerlessFunctions = () => {
  const content = files.map((file) => fs.readFileSync(file, "utf-8"));
  return YAML.load(content.join(""), "utf8");
};

module.exports = concatServerlessFunctions;
