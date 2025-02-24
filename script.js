document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
      document.querySelector(".loading-screen").style.display = "none";
      document.querySelector(".content").style.display = "block";
    }, 3000);
    updateLeaderboard();
  });
  
  function submitMatchup() {
    let player1 = document.getElementById("player1").value;
    let player2 = document.getElementById("player2").value;
    let result = document.getElementById("result").value;
    
    if (!player1 || !player2 || player1 === player2) {
      alert("Please enter two different players.");
      return;
    }
  
    let players = JSON.parse(localStorage.getItem("players")) || {};
  
    // Ensure each player's record exists and includes an opponents object
    if (!players[player1]) {
      players[player1] = { wins: 0, losses: 0, ties: 0, opponents: {} };
    }
    if (!players[player2]) {
      players[player2] = { wins: 0, losses: 0, ties: 0, opponents: {} };
    }
    
    // Ensure head-to-head records exist
    if (!players[player1].opponents[player2]) {
      players[player1].opponents[player2] = { wins: 0, losses: 0, ties: 0 };
    }
    if (!players[player2].opponents[player1]) {
      players[player2].opponents[player1] = { wins: 0, losses: 0, ties: 0 };
    }
    
    // Update global and head-to-head records based on the matchup result
    if (result === "win") {
      players[player1].wins++;
      players[player2].losses++;
      players[player1].opponents[player2].wins++;
      players[player2].opponents[player1].losses++;
    } else if (result === "loss") {
      players[player2].wins++;
      players[player1].losses++;
      players[player2].opponents[player1].wins++;
      players[player1].opponents[player2].losses++;
    } else if (result === "tie") {
      players[player1].ties++;
      players[player2].ties++;
      players[player1].opponents[player2].ties++;
      players[player2].opponents[player1].ties++;
    }
    
    localStorage.setItem("players", JSON.stringify(players));
    updateLeaderboard();
  }
  
  function showLeaderboard() {
    document.querySelector(".main-screen").style.display = "none";
    document.querySelector(".leaderboard").style.display = "block";
  }
  
  function updateLeaderboard() {
    let players = JSON.parse(localStorage.getItem("players")) || {};
    let table = document.querySelector(".leaderboard table");
    let rows = `<tr>
                  <th>Player</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Ties</th>
                </tr>`;
  
    for (let player in players) {
      rows += `<tr>
                 <td><a href="#" class="player-name" onclick="showPlayerStats('${player}')">${player}</a></td>
                 <td>${players[player].wins}</td>
                 <td>${players[player].losses}</td>
                 <td>${players[player].ties}</td>
               </tr>`;
    }
  
    table.innerHTML = rows;
  }
  
  function showPlayerStats(player) {
    let players = JSON.parse(localStorage.getItem("players")) || {};
    let stats = players[player];
  
    if (!stats) return;
  
    let totalMatches = stats.wins + stats.losses + stats.ties;
    let overallWinRatio = totalMatches > 0 ? (stats.wins / totalMatches).toFixed(2) : "0.00";
  
    // Determine best and worst opponents based on head-to-head win percentages
    let bestOpponent = null;
    let worstOpponent = null;
    let bestRatio = -1;  // lower bound for best win ratio
    let worstRatio = 2;  // upper bound for worst win ratio
  
    if (stats.opponents) {
      for (let opp in stats.opponents) {
        let oppStats = stats.opponents[opp];
        let oppTotal = oppStats.wins + oppStats.losses + oppStats.ties;
        if (oppTotal > 0) {
          let ratio = oppStats.wins / oppTotal;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestOpponent = opp;
          }
          if (ratio < worstRatio) {
            worstRatio = ratio;
            worstOpponent = opp;
          }
        }
      }
    }
  
    // Format the ratios if a valid matchup exists; otherwise, use "N/A"
    let bestRatioDisplay = bestOpponent ? bestRatio.toFixed(2) : "N/A";
    let worstRatioDisplay = worstOpponent ? worstRatio.toFixed(2) : "N/A";
  
    document.getElementById("stats-player").innerText = `Stats for ${player}`;
    document.getElementById("stats-details").innerHTML = `
      <p>Wins: ${stats.wins}</p>
      <p>Losses: ${stats.losses}</p>
      <p>Ties: ${stats.ties}</p>
      <p>Total Matches: ${totalMatches}</p>
      <p>Overall Win/Loss Ratio: ${overallWinRatio}</p>
      <p>Best Opponent: ${bestOpponent ? bestOpponent + " (Win Ratio: " + bestRatioDisplay + ")" : "N/A"}</p>
      <p>Worst Opponent: ${worstOpponent ? worstOpponent + " (Win Ratio: " + worstRatioDisplay + ")" : "N/A"}</p>
    `;
  
    document.querySelector(".player-stats").style.display = "block";
  }
  
  function closeStats() {
    document.querySelector(".player-stats").style.display = "none";
  }
  