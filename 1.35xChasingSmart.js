//////////////////////////////////
// MartinG's Martingale
// v 2.0.3
/*////////////////////////////////
 
MartinG's Martingale, is just a classic martingale strategy that makes it 
really easy to configure.
 
Just tell it what streak protection you want (maxLossStreakPerRound) and how 
much you can afford to loose if there is a streak (costOfLoosingRound).
 
Also you can set the desired cashout.
 
There is no need to calculate the base bet or multiplier.
 
NOTE: Base Bet will be printed in console. If your base bet is less than 1 bit, 
that probably means your costOfLoosingRound is too low or your 
maxLossStreakPerRound is too high.
 
*//////////////////////////////////
 
var cashout = 1.35;
var maxLossStreakPerRound = 3;
var costOfLoosingRound = 500;
 
/////////////////////////////////
// No need to change anything below this line
/////////////////////////////////
 
var baseBet = 1;
 
var p = baseBet * (cashout - 1);
 
var losses = 0;
var lostBits = 0;
var nextBet = baseBet;
 
function loose(_lostBits, _nextBet, _losses) {
 
		if(_losses >= maxLossStreakPerRound) {
 
			return _lostBits;
 
		} else {
 
			_lostBits = _lostBits + _nextBet + p;	
			_nextBet = (_lostBits + p) / (cashout - 1);
			return loose(_lostBits, _nextBet, _losses + 1);
 
		}
 
}
 
baseBet = costOfLoosingRound/loose(0,baseBet,0);
p = baseBet * (cashout - 1);
nextBet = baseBet;
 
console.log("Base Bet: " + baseBet);
 
var playing = false;
 
engine.on('game_starting', function(info) {
 
	engine.placeBet(Math.floor(nextBet)*100, Math.round(cashout * 100));
	playing = true;
 
});
 
engine.on('game_crash', function(data) {
 
	if(!playing) {
		return;	
	}
 
	playing = false;
 
	if(engine.lastGamePlay() == 'LOST') {
 
		losses = losses + 1;
		lostBits = lostBits + nextBet + p;
 
		if(losses >= maxLossStreakPerRound) {
 
			losses = 0;
			lostBits = 0;	
			nextBet = baseBet;
 
		} else {
 
			nextBet = (lostBits + p) / (cashout - 1);
 
		}
 
	} else {
 
		losses = 0;	
		lostBits = 0;
		nextBet = baseBet;
 
	}
 
});