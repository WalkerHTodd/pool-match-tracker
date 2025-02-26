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

  
  function showPlayerStats(playerName) {
    fetch("https://api.jsonbin.io/v3/b/67bf6c75acd3cb34a8f178dd/latest", {
        headers: { "X-Master-Key": "$2a$10$Ia4Urf.zWbu9aHkKVrCYyelvMlDUJmd3myQenmv4DVxv75f3Och1O" }
    })
    .then(response => response.json())
    .then(data => {
        let leaderboard = data.record.leaderboard;
        let player = leaderboard.find(p => p.name === playerName);

        if (!player) {
            alert("Player not found.");
            return;
        }

        let totalMatches = player.wins + player.losses + player.ties;
        let winRatio = totalMatches > 0 ? (player.wins / totalMatches).toFixed(2) : "0.00";

        document.getElementById("stats-player").innerText = `Stats for ${player.name}`;
        document.getElementById("stats-details").innerHTML = `
            <p>Wins: ${player.wins}</p>
            <p>Losses: ${player.losses}</p>
            <p>Ties: ${player.ties}</p>
            <p>Total Matches: ${totalMatches}</p>
            <p>Win/Loss Ratio: ${winRatio}</p>
        `;

        document.querySelector(".player-stats").style.display = "block";
    })
    .catch(error => console.error("Error loading player stats:", error));
  }

  
  function closeStats() {
    document.querySelector(".player-stats").style.display = "none";
  }
  
  document.addEventListener("DOMContentLoaded", function() {
    updateLeaderboard(); // Load leaderboard instantly
  });

