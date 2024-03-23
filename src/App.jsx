import { useState, useEffect } from 'react'
import './App.css'

const App = () => {
  const [raceResults, setRaceResults] = useState()
  const [qualiResults, setQualiResults] = useState()
  const [standings, setStandings] = useState()

  const dnfCheck = (string) => {
    if (string === "Finished" || string.slice(-3) === "Lap"){
      return false
    }
    return true
  }

  const constructors = {
    red_bull: {
      drivers: ["VER", "PER"]
    },
    ferrari: {
      drivers: ["SAI", "LEC"]
    },
    mercedes: {
      drivers: ["HAM", "RUS"]
    },
    mclaren: {
      drivers: ["PIA", "NOR"]
    },
    aston_martin: {
      drivers: ["ALO", "STR"]
    },
    sauber: {
      drivers: ["BOT", "ZHO"]
    },
    haas: {
      drivers: ["MAG", "HUL"]
    },
    rb: {
      drivers: ["RIC", "TSU"]
    },
    williams: {
      drivers: ["ALB", "SAR"]
    },
    alpine: {
      drivers: ["OCO", "GAS"]
    }
  }

  const fantasyTeams = {
    brad: {
      drivers: ["RUS", "HAM", "ZHO", "STR"]
    },
    devin: {
      drivers: ["VER", "OCO", "MAG", "GAS"]
    },
    darren: {
      drivers: ["RIC", "ALO", "SAR", "PER"]
    },
    derrick: {
      drivers: ["ALB", "SAI", "NOR", "BOT"]
    },
    joey: {
      drivers: ["HUL", "LEC", "TSU", "PIA"]
    }
  }

  // define constructors
  // check drivers' constructor/name included in constructors[teamName].drivers
  // if driver not in their constructor's drivers
    // flag as sub on team
    // see who's missing, flag as out of team
    // map sub to missing driver

  const checkForSubs = () => {
    // run per session after data grabs during points summation calulation for teams
  }

  const getRaceResults = async () => {
    const response = await fetch("https://ergast.com/api/f1/2024/results.json?limit=480").then((res) => {
      return res.json()
    })
    console.log("Response", response)
    const season = []
    response.MRData.RaceTable.Races.map((race) => {
      const results = race.Results.map((data) => {
        return {
          driver: data.Driver.code, 
          position: parseInt(data.position), 
          fastest: data?.FastestLap ? parseInt(data.FastestLap.rank) === 1 : false, 
          dnf: dnfCheck(data.status)}
      })
      season.push(results)
    })
    console.log(season)
    setRaceResults(season)
  }

  const checkQualiOut = (data) => {
    let mod = undefined
    if (data?.Q3){
      mod = 5
    } else if (data?.Q2){
      mod = 0
    } else {
      mod = -5
    }
    if (parseInt(data.position) === 1){
      mod = mod + 5
    }
    return mod
  }

  const getQualiResults = async () => {
    const response = await fetch("https://ergast.com/api/f1/2024/qualifying.json?limit=480").then((res) => {
      return res.json()
    })
    console.log("Quali", response)
    const season = []
    response.MRData.RaceTable.Races.map((race) => {
      const results = race.QualifyingResults.map((data) => {
        return {
          driver: data.Driver.code, 
          position: parseInt(data.position), 
          modifier: checkQualiOut(data)}
      })
      season.push(results)
    })
    console.log(season)
    setQualiResults(season)
  }

  const calcPoints = (driver) => {
    
    return (11 - driver.position) * 2
  }

  const generateStandings = () => {
    const drivers = {}
    console.log("generating standings with ", raceResults)
    if (raceResults?.length) {
      for (const race in raceResults){
        console.log("race", race)
        for (const driver in raceResults[race]) {
          console.log("driver", raceResults[race][driver].driver)
          drivers[raceResults[race][driver].driver] 
            ? drivers[raceResults[race][driver].driver]+= calcPoints(raceResults[race][driver])
            : drivers[raceResults[race][driver].driver] = calcPoints(raceResults[race][driver])
        }
      }
    }
    if (qualiResults?.length){
      for (const session in qualiResults){
        console.log("quali")
        for (const driver in qualiResults[session]){
          console.log("quali driver", qualiResults[session][driver])
          drivers[qualiResults[session][driver].driver]
            ? drivers[qualiResults[session][driver].driver]+= qualiResults[session][driver].modifier
            : drivers[qualiResults[session][driver].driver] = qualiResults[session][driver].modifier
        }
      }
    }
    console.log("Drivers with points: ", drivers)
    setStandings(drivers)
  }

  const getResults = async () => {
    await getQualiResults()
    await getRaceResults()
  }

  const printStandings = () => {
    const rows = []
    for (const driver in standings){
        rows.push(
          <tr>
            <td>{driver}</td>
            <td>{standings[driver]}</td>
          </tr>
        )
    }
    return (
      <table>
        <thead>
          <th>Driver</th>
          <th>Points</th>
        </thead>
        {...rows}
      </table>
    )
  }

  useEffect(()=>{
    getResults()
  }, [])

  useEffect(() => {
    generateStandings()
  }, [qualiResults, raceResults])

  return (
    <>
      <h1>Standings</h1>
      { standings
        ? printStandings()
        : null
      }
    </>
  )
}

export default App
