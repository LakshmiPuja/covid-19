const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Runni at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
  }
};
initializeDbServer();

//API 1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `SELECT state_id AS stateId,state_name As stateName,population As population FROM state ORDER BY state_id;`;
  const statesArray = await db.all(getStatesQuery);
  response.send(statesArray);
});

//API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `SELECT state_id AS stateId,state_name As stateName,population As population FROM state WHERE state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  response.send(state);
});

//API 3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
    VALUES('${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths});`;
  await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `SELECT district_id AS districtId,district_name AS districtName,state_id AS stateId,cases AS cases,cured AS cured,active AS active, deaths AS deaths FROM district WHERE district_id = ${districtId};`;
  const district = await db.get(getDistrictQuery);
  response.send(district);
});

//API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `DELETE FROM district WHERE district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `UPDATE district 
    SET
    district_name='${districtName}',
    state_id = ${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths = ${deaths}
    WHERE district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getTotalList = `SELECT 
   SUM(cases) AS totalCases,
   SUM(cured) AS totalCured,
    SUM(active) AS totalActive, 
    SUM(deaths) AS totalDeaths 
  FROM  
  state
   NATURAL JOIN 
   district 
  WHERE state_id =${stateId};`;
  const totalList = await db.get(getTotalList);
  response.send(totalList);
});
// API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictTotalList = `SELECT  state_name AS stateName 
  FROM  state NATURAL JOIN district 
  WHERE district_id = ${districtId};`;
  const districtDetails = await db.get(getDistrictTotalList);
  response.send(districtDetails);
});

module.exports = app;
