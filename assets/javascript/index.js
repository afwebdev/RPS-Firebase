$(document).ready(function() {
	let p1Name;
	let p2Name;

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

			//2 Active players are present.
			if (sv.player1Active === "true" && sv.player2Active === "true") {
				//Start game, both players are present.
				console.log("2 PLAYERSSSS");
			} else if (sv.player1Active === "true") {
				// ** PLAYER2 LEFT, OR HAS NOT CONNECTED **
				//Player 1 is the only player who is active,  Build Lobby.
				console.log("Only 1 player present, and its player 1");
			} else if (sv.player2Active === "true") {
				console.log("Only 1 player is present and its player 2");
			}
		},
		function(errorObject) {
			// In case of error this will print the error
			console.log("Read from DB Failed: " + errorObject.code);
		}
	);

	const lobby = function() {
		$(".container").append(`
		<div id="lobby" >
			
		</div>`);
	};

	$("#start").on("click", function(e) {
		e.preventDefault();
		input = $("#name").val();

		//user entered input, remove intro (login) screen
		if (input !== true) {
			$("#name").attr("placeholder", "..you got a name?");
		}

		//Check if player1 is active in the database, if its not, set player1Name to name, and status to active.
		if (p1Active === "undefined" && input.length >= 4) {
			$(".intro").remove();
			console.log("HELLo");
			playerX = "player1";
			database.ref().update({
				player1Name: input,
				player1Active: "true"
			});
		} else if (p2Active === "undefined" && input.length >= 4) {
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