/***************
	base_bet: Bets will range from 1 bit to base_bet * 2 bits
	oscillation_length: The number of bets to make in one cycle
	cashout: Where to cashout
			 
****************/

	var base_bet = 100; 
	var oscillation_length = 50;

	var cashout = 1.03;
	
/***************/

cashout = Math.round(cashout * 100);

var i = 0;
var counter = 0;
var increase = Math.PI * 2 / oscillation_length;

function next() {
	i++;
	if(i > oscillation_length) i=0;
	
	var y = Math.sin(counter) * base_bet + base_bet + 1;
	counter += increase;		
	return Math.floor(y) * 100;
}

engine.on('game_starting', function(info) {	
	var bet = next();
	console.log("Betting " + bet/100);
	engine.placeBet(bet, cashout);
});