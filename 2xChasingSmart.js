// Settings
var baseBet = 1; 
var baseMultiplier = 2.00; 
var variableBase = false; 
var streakSecurity = 30; 
var maximumBet = 999999; 
var baseSatoshi = baseBet * 100; // Calculated
var currentBet = baseSatoshi;
var currentMultiplier = baseMultiplier;
var currentGameID = -1;
var firstGame = true;
var lossStreak = 0;
var coolingDown = false;
 
console.log('====== CoinsCrash ======');
console.log('My username is: ' + engine.getUsername());
console.log('Starting balance: ' + (engine.getBalance() / 100).toFixed(2) + ' bits');
var startingBalance = engine.getBalance();
 
if (variableBase) {
      console.warn('[WARN] Variable mode is enabled and not fully tested. Bot is resillient to ' + streakSecurity + '-loss streaks.');
}
 

engine.on('game_starting', function(info) {
      console.log('====== New Game ======');
    console.log('[Bot] Game #' + info.game_id);
      currentGameID = info.game_id;
 
      if (coolingDown) {    
      if (lossStreak == 0) {
      coolingDown = false;
      }
      else {
      lossStreak--;
      console.log('[Bot] Cooling down! Games remaining: ' + lossStreak);
      return;
      }
      }
 
      if (!firstGame) { // Display data only after first game played.
      console.log('[Stats] Session profit: ' + ((engine.getBalance() - startingBalance) / 100).toFixed(2) + ' bits');
      console.log('[Stats] Profit percentage: ' + (((engine.getBalance() / startingBalance) - 1) * 100).toFixed(2) + '%');
      }
 
      if (engine.lastGamePlay() == 'LOST' && !firstGame) { // If last game loss:
      lossStreak++;
      var totalLosses = 0; // Total satoshi lost.
      var lastLoss = currentBet; // Store our last bet.
      while (lastLoss >= baseSatoshi) { // Until we get down to base bet, add the previous losses.
      totalLosses += lastLoss;
      lastLoss /= 4;
      }
 
      if (lossStreak > streakSecurity) { // If we're on a loss streak, wait a few games!
      coolingDown = true;
      return;
      }
 
      currentBet *= 2; 
      currentMultiplier = 1.42 + (totalLosses / currentBet);
      }
      else { // Otherwise if win or first game:
      lossStreak = 0; // If it was a win, we reset the lossStreak.
      if (variableBase) { // If variable bet enabled.
      // Variable mode resists (currently) 1 loss, by making sure you have enough to cover the base and the 4x base bet.
      var divider = 100;
      for (i = 0; i < streakSecurity; i++) {
      divider += (100 * Math.pow(4, (i + 1)));
      }
 
      newBaseBet = Math.min(Math.max(1, Math.floor(engine.getBalance() / divider)), maximumBet * 100); // In bits
      newBaseSatoshi = newBaseBet * 100;
 
      if ((newBaseBet != baseBet) || (newBaseBet == 1)) {
      console.log('[Bot] Variable mode has changed base bet to: ' + newBaseBet + ' bits');
      baseBet = newBaseBet;
      baseSatoshi = newBaseSatoshi;
      }
      }
      // Update bet.
      currentBet = baseSatoshi; // in Satoshi
      currentMultiplier = baseMultiplier;
      }
 
      // Message and set first game to false to be sure.
      console.log('[Bot] Betting ' + (currentBet / 100) + ' bits, cashing out at ' + currentMultiplier + 'x');
      firstGame = false;
 
      if (currentBet <= engine.getBalance()) { // Ensure we have enough to bet
      if (currentBet > (maximumBet * 100)) { // Ensure you only bet the maximum.
      console.warn('[Warn] Bet size exceeds maximum bet, lowering bet to ' + (maximumBet * 100) + ' bits');
      currentBet = maximumBet;
      }
      engine.placeBet(currentBet, Math.round(currentMultiplier * 100), false);
      }
      else { // Otherwise insufficent funds...
      if (engine.getBalance() < 100) {
      console.error('[Bot] Insufficent funds to do anything... stopping');
      engine.stop();
      }
      else {
      console.warn('[Bot] Insufficent funds to bet ' + (currentBet / 100) + ' bits.');
      console.warn('[Bot] Resetting to 1 bit basebet');
      baseBet = 1;
      baseSatoshi = 100;
      }
      }
});
 
engine.on('game_started', function(data) {
    if (!firstGame) { console.log('[Bot] Game #' + currentGameID + ' has started!'); }
});
 
engine.on('cashed_out', function(data) {
    if (data.username == engine.getUsername()) {      
      console.log('[Bot] Successfully cashed out at ' + (data.stopped_at / 100) + 'x');
      }
});
 
engine.on('game_crash', function(data) {
    if (!firstGame) { console.log('[Bot] Game crashed at ' + (data.game_crash / 100) + 'x'); }
});