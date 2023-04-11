/*   Random CoinsCRASH script.
 *   Current status: Random 
 *  Version 2.2.7-custom
 *  + When editing the variables, be careful to not remove any ';' or ',' character.
 */
 
 // The bot will bet a random number between `smallRangeBet` and `bigRangeBet` on a random cashout point.
var smallRangeBet = 10, // (10 bits) can't bet less than 1 bit
    bigRangeBet = 18, // (18 bits) cant bet more than your bankroll
    maxBet = 900, // (900 bits, set to 0 to disable) The bot won't bet higher than this amount
    maxCashout = 100; // (100x) this is the maximum cashout point the script can go
 
var Simulation = false; // (true/false) Setting this to true will make the bot to simulate a betting run.
 
// --- Edit over this line --- \\
 
 var totalLost = 0;
 var lastBet = 0, bet = 0, profit = 0, wins = 0, loss = 0, firstgame = true, cashout;
 var chilling = false;
engine.on('game_starting', function(info) {
    console.log((Simulation?"(SIMULATION) ": "")+"Current Profit: "+(profit/100).toFixed(2)+" bits ("+wins+" Wins | "+loss+" Loses)");
    if(chilling) chilling = false;
    if(firstgame) firstgame = false;
    bet = Math.round(randomInt(smallRangeBet*100,bigRangeBet*100)/100)*100;
    var rand = randomInt(1,100);
    for(var i=1;i<maxCashout+1;i+=0.01){
        var curProb = (9900/(101*((i*100)-1)))*100;
        if(rand==1 && i == 1){
            console.log(" /!\\ 1% protection... Not betting!");
            chilling = true;
            break;
        }
        if(!chilling && rand>curProb){
            cashout = i.toFixed(2);
            cashout = Math.round(cashout*100);
            if(totalLost>0){
                var onLossIncrement = Math.round((totalLost * (randomInt(30, 90)/100)/100))*100;
                bet += onLossIncrement;
                console.log((Simulation?"(SIMULATION) ": "")+"(Recovery mode) adding "+(onLossIncrement/100)+" bits to the bet amount");
            }
            if(bet > maxBet*100 && maxBet != 0){
                console.log(" /!\\ Bet amount higher than the maxBet. For your safty, setting the bet to: "+maxBet+" bits");
                bet = maxBet * 100;
            }
            if(!Simulation){
                engine.placeBet(bet, cashout, function(){
                    console.log("Betting "+(bet/100)+" bits on x"+(cashout/100));
                    lastBet = bet;
                });
            }else{
                console.log("(SIMULATION) Betting "+(bet/100)+" bits on x"+(cashout/100));
                lastBet = bet;
            }
            break;
        }
    }
});
 
engine.on('cashed_out', function(data) {
    if(data.username==engine.getUsername()){
        console.log("(Win) Cashed out at x"+(data.stopped_at/100));
        wins++;
        profit += ((lastBet*(data.stopped_at/100))-lastBet);
        if(totalLost>0){
            totalLost -= ((bet*(data.stopped_at/100))-lastBet);
            if(totalLost<0) totalLost = 0;
        }
    }
});
 
engine.on('game_crash', function(data) {
    if(!chilling && data.game_crash < cashout && !firstgame){
        console.log((Simulation?"(SIMULATION) ": "")+"(Lost)");
        loss++;
        profit -= lastBet;
        totalLost += lastBet;
    }
    if(!chilling && data.game_crash >= cashout && Simulation && !firstgame){
        console.log("(SIMULATION) (Win) Cashed out at x"+(cashout/100));
        wins++;
        profit += ((lastBet*(cashout/100))-lastBet);
        if(totalLost>0){
            totalLost -= ((bet*(cashout/100))-lastBet);
            if(totalLost<0) totalLost = 0;
        }
    }
    if(firstgame) firstgame = false;
});
 
function randomInt(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}