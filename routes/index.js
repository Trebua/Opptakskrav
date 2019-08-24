var express = require("express");
var router = express.Router();

const fs = require("fs");
const { check, validationResult } = require("express-validator");

const studyToCode = JSON.parse(fs.readFileSync("db/study_to_code.json"));
const studyData = JSON.parse(fs.readFileSync("db/study_data.json"));
const topList = JSON.parse(fs.readFileSync("db/top_list.json"));

const latestYear =
  studyData["194760"].years[studyData["194760"].years.length - 1];

router.get("/", function(req, res, next) {
  res.render("index", { topList, latestYear });
});

router.get(
  "/sok",
  [
    check("sokeord")
      .trim()
      .escape()
      .isLength({ max: 50 })
  ],
  function(req, res, next) {
    const errors = validationResult(req).errors;
    if (errors.length) {
      res.render("error", { msg: "Feil input" });
    }
    const searchQuery = req.query.sokeord;
    const matches = searchQuery ? findMatches(searchQuery) : {};
    const headerText = searchQuery
      ? `Søkeresultater for "${searchQuery}"`
      : "Søk";
    const numMatches = Object.keys(matches).length;
    res.render("search", {
      matches,
      searchQuery,
      headerText,
      numMatches
    });
  }
);

router.get("/:id([0-9]+)", function(req, res, next) {
  const studyID = req.params.id;
  const data = studyData[studyID];
  const chartConfig = getChartConfig(data);
  data["predictionYears"] = [
    ...data.years,
    parseInt(data.years[data.years.length - 1]) + 1
  ];
  res.render("study", { data, chartConfig });
});

router.get("/om", function(req, res) {
  res.render("about");
});

router.get("/nyttige-lenker", function(req, res) {
  res.render("usefulLinks");
});

function findMatches(query) {
  const queries = query.split(" ");
  return Object.keys(studyToCode)
    .filter(key =>
      queries.every(query => key.toLowerCase().includes(query.toLowerCase()))
    )
    .reduce((obj, key) => {
      obj[key] = studyToCode[key];
      return obj;
    }, {});
}

function getChartConfig(data) {
  const validORDPred = data.ORDPred[data.ORDPred.length - 1] > 20;
  const validORDFPred = data.ORDFPred[data.ORDFPred.length - 1] > 20;
  let max = Math.max(
    ...data.ORD,
    ...data.ORDF,
    data.ORDFPred[data.ORDFPred.length - 1],
    data.ORDPred[data.ORDFPred.length - 1]
  );
  max = Math.floor(max / 10) * 10;
  max = max + 10 > 70 ? 70 : max + 10;
  let min = Math.min(
    ...data.ORD,
    ...data.ORDF,
    data.ORDFPred[data.ORDFPred.length - 1],
    data.ORDPred[data.ORDPred.length - 1]
  );
  min = Math.ceil(min / 10) * 10;
  min = min - 10 < 20 ? 20 : min - 10;
  return {
    validORDFPred,
    validORDPred,
    min,
    max
  };
}

module.exports = router;
