$(document).ready(function() {
	let p1Name;
	let p2Name;

	let p1Hand;
	let p2Hand;

	let chosenHand;
	let enemyHand;

	let winner;

	let playerX;

	let p1Active;
	let p2Active;

	// Firebase configuration
	let config = {
		apiKey: "AIzaSyBL_nASXuC6Vk2BvuPQkMnNdqngSvroj6k",
		authDomain: "rockpaperscissors-8fc5d.firebaseapp.com",
		databaseURL: "https://rockpaperscissors-8fc5d.firebaseio.com",
		projectId: "rockpaperscissors-8fc5d",
		storageBucket: "rockpaperscissors-8fc5d.appspot.com",
		messagingSenderId: "703500050997",
		appId: "1:703500050997:web:bb6b5cbbd4b3b8ad"
	};
	// Initialize Firebase
	firebase.initializeApp(config);

	// Get a reference to the database
	let database = firebase.database();

	//Database 'listener' Snapshot of database changes on updates to it.
	database.ref().on(
		"value",
		function(snapshot) {
			let sv = snapshot.val();
			console.log(sv);

			//Set global variables = to current snapshot values.
			p1Name = sv.player1Name;
			p2Name = sv.player2Name;
			p1Active = sv.player1Active;
			p2Active = sv.player2Active;
			p1Hand = sv.player1Hand;
			p2Hand = sv.player2Hand;

			//Both players have picked a hand now.
			if (p1Hand !== "undefined" && p2Hand !== "undefined") {
				//Display Player hand
				$(`.player`).html(
					`<img src="./assets/img/${chosenHand}.png"><span>${chosenHand}</span>`
				);

				//Display enemy hand
				if (playerX === "player1") {
					enemyHand = p2Hand;
					$(`.enemy`).html(
						`<img src="./assets/img/${p2Hand}.png"><span>${p2Hand}</span>`
					);
				} else if (playerX === "player2") {
					enemyHand = p1Hand;
					$(`.enemy`).html(
						`<img src="./assets/img/${p1Hand}.png"><span>${p1Hand}</span>`
					);
				}

				whoWon(chosenHand, enemyHand);
			}

			if (sv.player1Active === "true" && sv.player2Active === "true") {
				//Debug logging. CLEAN UP LATER
				//2 Active players are present.
				//Start game, both players are present.
				console.log("2 PLAYERSSSS");
				checkReady(); //RUNS EVERYTIME DB UPDATES A NEW VALUE
			} else if (sv.player1Active === "true") {
				// ** PLAYER2 LEFT, OR HAS NOT CONNECTED **
				//Player 1 is the only player who is active,  Build Lobby.
				console.log("Only 1 player present, and its player 1");
			} else if (sv.player2Active === "true") {
				console.log("Only 1 player is present and its player 2");
			}
		},
		function(errorObject) {
			//Log DB error
			console.log("Read from DB Failed: " + errorObject.code);
		}
	);

	//Function Declarations

	const whoWon = function(playerHand, enemyHand) {
		//Player Won
		if (
			(playerHand === "rock" && enemyHand === "scissors") ||
			(playerHand === "paper" && enemyHand === "rock") ||
			(playerHand === "scissors" && enemyHand === "paper")
		) {
			winner = playerX;
			//EDIT THE DOM TO SHOW THAT PLAYER WON
			$("#status").append(
				`<div class="announcement"><h5 class="message">YOU WON</h5></div>`
			);
			//Player lost. The player num who won is.
		} else {
			if (playerX === "player1") {
				winner = "player2";
			} else if (playerX === "player2") {
				winner = "player1";
			}
			//EDIT THE DOM TO SHOW THAT ENEMY WON.
			$("#status").append(
				`<div class="announcement"><h5 class="message">ENEMY WON</h5></div>`
			);
		}
		return winner;
	};

	const lobby = function() {
		$(".container").append(`
	<div id="lobby">
		<div id="player">
			<form>
				<button data-hand="rock">Rock</button>
				<button data-hand="paper">Paper</button>
				<button data-hand="scissors">Scissors</button>
			</form>
		</div>
		<div id="status">
			<div id="battle">
				<h2 id='waiting'>Waiting For Player</h2>
				<div class="player"></div>
				<div class="enemy"></div>
			</div>
		</div>
		<div id="enemy">
			<p>Enemy:</p>
			<h4 class="enemy-name">...</h4>
		</div>
	</div>`);
	};

	const checkReady = function() {
		//remove waiting for player screen.
		if (p1Active !== "undefined" && p2Active !== "undefined") {
			$("#waiting").remove();
		}

		//Set enemy name
		if (playerX === "player1") {
			$(".enemy-name").text(p2Name);
		} else if (playerX === "player2") {
			$(".enemy-name").text(p1Name);
		}
	};

	//Click handlers
	//user clicked a hand button
	$(".container").on("click", "button", function(e) {
		e.preventDefault();
		let hand = this.dataset.hand;
		chosenHand = hand;

		database.ref().update({
			[`${playerX}Hand`]: hand
		});
		$("#player form button").attr("disabled", true);
	});

	//Start Button
	$("#start").on("click", function(e) {
		e.preventDefault();
		input = $("#name").val();

		if (input !== true) {
			$("#name").attr("placeholder", "..you got a name?");
		}

		//Check if player1 is active in the database, if its not, set player1Name to name, and status to active.
		if (p1Active === "undefined" && input.length >= 4) {
			$(".intro").remove();
			lobby();
			playerX = "player1";
			database.ref().update({
				player1Name: input,
				player1Active: "true"
			});
		} else if (p2Active === "undefined" && input.length >= 4) {
			lobby();
			$(".intro").remove();
			playerX = "player2";
			database.ref().update({
				player2Name: input,
				player2Active: "true"
			});
		} else {
			$("#name").val("");
			$("#name").attr("placeholder", "Enter a name 4+ char long");
		}
	}); //End On Click, End of LOGIN BUTTON CLICK.

	//Player disconnect. Revert variables in DB to clean slate for current player.
	//Player has left game.
	$(window).on("unload", function() {
		if (playerX != undefined) {
			database
				.ref()
				.onDisconnect()
				.update({
					[`${playerX}Active`]: "undefined",
					[`${playerX}Name`]: "undefined",
					[`${playerX}Hand`]: "undefined"
				});
		}
	});
});
