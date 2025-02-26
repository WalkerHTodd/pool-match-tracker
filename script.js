document.addEventListener("DOMContentLoaded", function() {
    setTimeout(() => {
      document.querySelector(".loading-screen").style.display = "none";
      document.querySelector(".content").style.display = "block";
    }, 3000);
    updateLeaderboard();
  });
  
  function submitMatchup() {
    let player1 = document.getElementById("player1").value.trim();
    let player2 = document.getElementById("player2").value.trim();
    let result = document.getElementById("result").value;

    if (!player1 || !player2 || player1 === player2) {
        alert("Please enter two different players.");
        return;
    }

    fetch("https://api.jsonbin.io/v3/b/67bf6c75acd3cb34a8f178dd/latest", {
        headers: { "X-Master-Key": "$2a$10$Ia4Urf.zWbu9aHkKVrCYyelvMlDUJmd3myQenmv4DVxv75f3Och1O" }
    })
    .then(response => response.json())
    .then(data => {
        let leaderboard = data.record.leaderboard;

        let p1 = leaderboard.find(p => p.name === player1) || { name: player1, wins: 0, losses: 0, ties: 0 };
        let p2 = leaderboard.find(p => p.name === player2) || { name: player2, wins: 0, losses: 0, ties: 0 };

        if (result === "win") {
            p1.wins++;
            p2.losses++;
        } else if (result === "loss") {
            p2.wins++;
            p1.losses++;
        } else if (result === "tie") {
            p1.ties++;
            p2.ties++;
        }

        let updatedLeaderboard = leaderboard.filter(p => p.name !== player1 && p.name !== player2);
        updatedLeaderboard.push(p1, p2);

        return fetch("https://api.jsonbin.io/v3/b/67bf6c75acd3cb34a8f178dd", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": "$2a$10$Ia4Urf.zWbu9aHkKVrCYyelvMlDUJmd3myQenmv4DVxv75f3Och1O"
            },
            body: JSON.stringify({ leaderboard: updatedLeaderboard })
        });
    })
    .then(() => updateLeaderboard())
    .catch(error => console.error("Error updating leaderboard:", error));
  }

  
  // function showLeaderboard() {
  //   document.querySelector(".main-screen").style.display = "none";
  //   document.querySelector(".leaderboard").style.display = "block";
  // }
  
  function updateLeaderboard() {
    let table = document.querySelector(".leaderboard table");
    let rows = `<tr><th>Player</th><th>Wins</th><th>Losses</th><th>Ties</th></tr>`;

    fetch("https://api.jsonbin.io/v3/b/67bf6c75acd3cb34a8f178dd/latest", {
        headers: { "X-Master-Key": "$2a$10$Ia4Urf.zWbu9aHkKVrCYyelvMlDUJmd3myQenmv4DVxv75f3Och1O" }
    })
    .then(response => response.json())
    .then(data => {
        let leaderboard = data.record.leaderboard;
        leaderboard.sort((a, b) => b.wins - a.wins); // Sort by wins

        leaderboard.forEach(player => {
            rows += `<tr>
                        <td><a href="#" class="player-name" onclick="showPlayerStats('${player.name}')">${player.name}</a></td>
                        <td>${player.wins}</td>
                        <td>${player.losses}</td>
                        <td>${player.ties}</td>
                     </tr>`;
        });

        table.innerHTML = rows;
    })
    .catch(error => console.error("Error loading leaderboard:", error));
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
  
  document.addEventListener("DOMContentLoaded", function() {
    updateLeaderboard(); // Load leaderboard instantly
  });

