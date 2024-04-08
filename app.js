const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const databasePath = path.join(__dirname, 'cricketTeam.db')
app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team;`

  const playerArray = await database.all(getPlayersQuery)
  response.send(
    playerArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  select *
  from cricket_team
  where player_id = ${playerId};`
  const player = await database.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayerQuerry = `
  INSERT INTO
   cricket_team (player_name, jersey_name, role)
  VALUES
   ('${playerName}', ${jerseyNumber}, '${role}');`

  const player = await database.run(postPlayerQuerry)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayerQuerry = `
  updat cricket_team
  set 
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role = '${role}'
  where 
    player_id = ${playerId};`

  await database.run(updatePlayerQuerry)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuerry = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`

  await database.run(deletePlayerQuerry)
  response.send('Player Removed')
})

module.exports = app
