/*  Emirue\'s CoinsCrash script
 *  Version 2.0
 *  Updated: 12/8/2019
 *  Description: This script has a starting cashout of 1.13x and a loss multiplier of 4x
 *				 On loss streaks, it uses a progressive cashout amount for better recovery
 */
 
 // TODO
 // check return code of bet for "GAME_IN_PROGRESS"
 // add timer (setTimeout)
 // include bonuses in profit (not possible in sim mode)
 // calculate profit per hour and per day
 // add stop when balance = x option

/*
 * User Settings 
 */
var streakSecurity = 4; // Number of loss streaks you want to be safe for
var risk = 0.50;	// Fraction of your bankroll you'll lose if a loss streak of streakSecurity + 1 occurs
						// Range: 0.01 - 1 || Higher = more risk/reward, lower = less risk/reward
						// Recommend range: 0.25 - 0.75

var restartOnMaxLossStreak = true; 	// (true/false) If true, bot will reinitialize baseBet and cashout amount
									// when a loss streak of streakSecurity + 1 occurs, otherwise it'll just stop
									// NOTE: if risk = 1, restarting may not be possible
						
var simulation = false;	// (true/false) Setting this to true will make the bot to simulate a betting run
						// If you've changed any of the user settings, it's always recommended to test...
						// ...your changes by letting the bot run in simulator mode for a bit
						
var simMsg = simulation ? '(SIMULATION) ' : ''; // This will appear in the console logs when running in simulator mode
 
/*
 * Initialize global settings and counters (don't touch at all)
 */
var firstGame = true,
	numWins = 0,
	numLosses = 0,
	maxWinStreak = 0,
	maxLossStreak = 0,
	currentWinStreak = 0,
	currentLossStreak = 0,
	totalSatoshiProfit = 0,
	currentGameID = -1,
	currentCashout = 0,
	currentBitBet = 0,
	currentSatoshiBet = 0,
	roundedSatoshiBet = 0,
	lastResult = 'NOT_PLAYED'; // NOT_PLAYED, WON, LOST
	
var startingBalance = engine.getBalance(); // in satoshi

/*
 * Initialize game settings (don't touch unless you know what you're doing)
 */

var baseCashout = 1.12;
var lossMultiplier = 4; // Increase base bet by this factor on loss
var cashoutAmounts = 
	[baseCashout, 1.24, 1.31, 1.33, 1.53]; 	// Cashout amount for current game are determined by...
											// ...indexing cashoutAmounts with currentLossTreak
											// NOTE: Length must be equal to streakSecurity + 1
											
var riskFactor = 0;
for (var i = 0; i <= streakSecurity; i++)		// need to sum all of the bet multipliers to...
{												// ...determine what the bankroll is divided by
	riskFactor += Math.pow(lossMultiplier, i);
};									

/*
 * Helper function to calculate the bet amount
 * based on current balance and user settings
 */											
function calcBaseBet()
{
	var currentBal = engine.getBalance();	
	return (risk * currentBal) / riskFactor;
}

// Calculate initialBaseBet (in satoshi) based on the user settings
var initialBaseBet = calcBaseBet();

console.log('========================== Emirue\'s CoinsCrash Bot ==========================');
console.log('My username is: ' + engine.getUsername());
console.log('Starting balance: ' + (startingBalance/100).toFixed(2) + ' bits');
console.log('Risk Tolerance: ' + (risk * 100).toFixed(2) + '%');
console.log('Inital base bet: ' + Math.round(initialBaseBet/100) + ' bits (real value ' + (initialBaseBet/100).toFixed(2) + ')');

if (simulation) { console.log('=========================== SIMULATION MODE ENABLED =========================='); };

engine.on('game_starting', function(data)
{
	if (!firstGame)  // Display stats only after first game played
	{
		console.log('==============================');
		console.log('[Stats] Session Profit: ' + (totalSatoshiProfit/100).toFixed(2) + ' bits');
		console.log('[Stats] Profit Percentage: ' + ((((totalSatoshiProfit + startingBalance) / startingBalance) - 1) * 100).toFixed(3) + '%');
		console.log('[Stats] Total Wins: ' + numWins + ' | Total Losses: ' + numLosses);
		console.log('[Stats] Max Win Streak: ' + maxWinStreak + ' | Max Loss Streak: ' + maxLossStreak);
	}
	else
	{
		firstGame = false;
	}
	
	currentGameID = data.game_id;
	console.log('=========== New Game ===========');
	console.log(simMsg + '[Bot] Game #' + currentGameID);

    if (lastResult === 'LOST' && !firstGame) // The stupid game crashed before we could cash out
	{
		if (currentLossStreak <= streakSecurity) // We lost, but it's okay, we've got it covered
		{
			currentSatoshiBet *= 4;
			currentCashout = cashoutAmounts[currentLossStreak];
		}
		else // *sigh* We were hoping this wouldn't happen, but it is gambling after all...
		{
			if (restartOnMaxLossStreak) // start betting over again with recalculated base bet
			{
				currentSatoshiBet = calcBaseBet();
				currentCashout = baseCashout;
				currentLossStreak = 0;
				
				console.warn(simMsg + '[Bot] Streak security surpassed, reinitializing bet amount to ' + Math.round(currentSatoshiBet/100));
			}
			else // Stop betting for now to lick our wounds
			{
				console.warn(simMsg + '[Bot] Betting stopped after streak security was surpassed');
				engine.stop();
			}
		}
    }
	else if (firstGame) // Let's get this show on the road
	{
		currentSatoshiBet = initialBaseBet;
		currentCashout = baseCashout;
	}
	else // Sweet, we won! Adjust the bet based on our balance
	{
		currentSatoshiBet = calcBaseBet();
		currentCashout = baseCashout;
	}
	
	currentBitBet = Math.round(currentSatoshiBet/100);
	roundedSatoshiBet = Math.round(currentBitBet * 100);
	
	if (currentBitBet > 0)
	{
		console.log(simMsg + '[Bot] Betting ' + currentBitBet + ' bits, cashing out at ' + currentCashout + 'x');
	}
	else
	{
		console.warn(simMsg + '[Bot] Base bet rounds to 0. Balance considered too low to continue.');
		engine.stop();
	}
	
	if (!simulation)
	{
		if (currentSatoshiBet <= engine.getBalance())  // Ensure we have enough to bet
		{
			engine.placeBet(roundedSatoshiBet, Math.round(currentCashout * 100), false);
		}
		else if (!simulation) // Whoops, we ran out of money
		{
			console.warn(simMsg + '[Bot] Insufficent funds to continue betting...stopping');
			engine.stop();
		}
	}
});

engine.on('cashed_out', function(data)
{
	if (data.username === engine.getUsername())
	{
		var lastProfit = (roundedSatoshiBet * (data.stopped_at/100)) - roundedSatoshiBet;
		console.log('[Bot] Successfully cashed out at ' + (data.stopped_at/100) + 'x (+' + (lastProfit/100).toFixed(2)  + ')');
		
		// Update global counters for win
		lastResult = 'WON';
        numWins++;
		currentWinStreak++;
		currentLossStreak = 0;
        totalSatoshiProfit += lastProfit;
		maxWinStreak = (currentWinStreak > maxWinStreak) ? currentWinStreak : maxWinStreak;
    }
});

engine.on('game_crash', function(data)
{
    if (data.game_crash < (currentCashout * 100) && !firstGame)
	{
		console.log(simMsg + '[Bot] Game crashed at ' + (data.game_crash/100) + 'x (-' + currentBitBet + ')');

		// Update global counters for loss
		lastResult = 'LOST';
		numLosses++;
		currentLossStreak++;
		currentWinStreak = 0;
        totalSatoshiProfit -= roundedSatoshiBet;
		
		maxLossStreak = (currentLossStreak > maxLossStreak) ? currentLossStreak : maxLossStreak;
    }
	else if (data.game_crash >= (currentCashout * 100) && simulation && !firstGame)
	{
		var lastProfit = (roundedSatoshiBet * currentCashout) - roundedSatoshiBet;
		console.log(simMsg + '[Bot] Successfully cashed out at ' + currentCashout + 'x (+' + (lastProfit/100).toFixed(2) + ')');
		
		// Update global counters for win
		lastResult = 'WON';
        numWins++;
		currentWinStreak++;
		currentLossStreak = 0;
        totalSatoshiProfit += lastProfit;
		maxWinStreak = (currentWinStreak > maxWinStreak) ? currentWinStreak : maxWinStreak;
    }
});