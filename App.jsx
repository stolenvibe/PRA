{\rtf1\ansi\ansicpg1252\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // App.jsx\
import React, \{ useState, useEffect \} from 'react';\
import Papa from 'papaparse';\
import _ from 'lodash';\
\
function App() \{\
  const [playerData, setPlayerData] = useState(\{\});\
  const [selectedPlayer, setSelectedPlayer] = useState('');\
  const [dfsPoints, setDfsPoints] = useState('');\
  const [prediction, setPrediction] = useState(null);\
\
  useEffect(() => \{\
    const loadData = async () => \{\
      try \{\
        // Replace this with your CSV data source\
        const response = await fetch('/nba_player_data2324.csv');\
        const text = await response.text();\
        \
        Papa.parse(text, \{\
          header: true,\
          dynamicTyping: true,\
          complete: function(results) \{\
            const data = results.data;\
            \
            // Group by player and calculate averages\
            const playerStats = _.groupBy(data, 'player_name');\
            const playerAverages = _.mapValues(playerStats, games => \{\
              if (games.length < 10) return null;\
              \
              const praGames = games.filter(g => g.points + g.rebounds + g.assists > 0);\
              return \{\
                games: games.length,\
                avgDfsPoints: _.meanBy(games, 'dfs_points'),\
                proportions: \{\
                  points: _.meanBy(praGames, g => g.points / (g.points + g.rebounds + g.assists)),\
                  rebounds: _.meanBy(praGames, g => g.rebounds / (g.points + g.rebounds + g.assists)),\
                  assists: _.meanBy(praGames, g => g.assists / (g.points + g.rebounds + g.assists))\
                \}\
              \};\
            \});\
            \
            setPlayerData(_.pickBy(playerAverages, v => v !== null));\
          \}\
        \});\
      \} catch (error) \{\
        console.error('Error loading data:', error);\
      \}\
    \};\
    \
    loadData();\
  \}, []);\
\
  const predictPRA = () => \{\
    if (!selectedPlayer || !dfsPoints || !playerData[selectedPlayer]) return;\
    \
    const estimatedPRA = dfsPoints * 0.8;\
    const props = playerData[selectedPlayer].proportions;\
    setPrediction(\{\
      points: (estimatedPRA * props.points).toFixed(1),\
      rebounds: (estimatedPRA * props.rebounds).toFixed(1),\
      assists: (estimatedPRA * props.assists).toFixed(1)\
    \});\
  \};\
\
  return (\
    <div className="max-w-2xl mx-auto p-4">\
      <div className="bg-white shadow rounded-lg p-6">\
        <h1 className="text-2xl font-bold mb-6">NBA PRA Predictor</h1>\
        <div className="space-y-4">\
          <div>\
            <label className="block text-sm font-medium mb-1">Select Player</label>\
            <select \
              className="w-full p-2 border rounded"\
              value=\{selectedPlayer\}\
              onChange=\{(e) => setSelectedPlayer(e.target.value)\}\
            >\
              <option value="">Select a player...</option>\
              \{Object.keys(playerData).sort().map(player => (\
                <option key=\{player\} value=\{player\}>\{player\}</option>\
              ))\}\
            </select>\
          </div>\
          \
          <div>\
            <label className="block text-sm font-medium mb-1">Projected DFS Points</label>\
            <input\
              type="number"\
              className="w-full p-2 border rounded"\
              value=\{dfsPoints\}\
              onChange=\{(e) => setDfsPoints(e.target.value)\}\
              placeholder="Enter projected DFS points"\
            />\
          </div>\
          \
          <button\
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"\
            onClick=\{predictPRA\}\
            disabled=\{!selectedPlayer || !dfsPoints\}\
          >\
            Predict PRA\
          </button>\
          \
          \{prediction && (\
            <div className="mt-4 p-4 bg-gray-50 rounded">\
              <h3 className="font-medium mb-2">Predicted Stats:</h3>\
              <div className="grid grid-cols-3 gap-4">\
                <div>\
                  <div className="text-sm text-gray-600">Points</div>\
                  <div className="text-xl font-bold">\{prediction.points\}</div>\
                </div>\
                <div>\
                  <div className="text-sm text-gray-600">Rebounds</div>\
                  <div className="text-xl font-bold">\{prediction.rebounds\}</div>\
                </div>\
                <div>\
                  <div className="text-sm text-gray-600">Assists</div>\
                  <div className="text-xl font-bold">\{prediction.assists\}</div>\
                </div>\
              </div>\
            </div>\
          )\}\
        </div>\
      </div>\
    </div>\
  );\
\}\
\
export default App;}