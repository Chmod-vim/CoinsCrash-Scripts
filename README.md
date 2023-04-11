# - JS scripts to run autonomously for the popular bitcoin gambling site <a href="https://www.coinscrash.com/">CoinsCrash.com</a>
CoinsCrash Scripts Bot

<h3>10x Chasing</h3>
In this script you can set the number of games that you want to wait before chasing the x10. Once this number of games is reached, it will bet the 'base bet' value that you sen when starting the script and double the bet when needed, to stay in profit.

<h3>2x Chasing</h3>
This script will chase the x2 multiplier. It will begin to bet only after the number of red games that you input. After that, it will begin a martingale until there is a green game.

<h3>Reverse Martingale</h3>
The idea of this script is to bet more after a won game, and return to base bet when you lost a game. In order to make profit, you can set a limit of won games, to go back to the base bet after a won game. 

<h3>Growing Payout</h3>
Here instead making the bet grow, we grow the payout. There is a minimum and maximum payout to input. If it goes until the maximum, the script is reversing the process to lower the damage.

<h3>OnTheMoon</h3>
That's a custom made script. Basically a martingale, but with a lot of parameters. There is a nice interface for you to adjust your betting strategy. You can use it to chase any multiplier.

<h3>Bouncy3x</h3>
Custom script. Constantly chasing 3x, unless it is in cooldown, which you can set as parameter of the script. Cooldown can be fixed or random between two values. For random cooldown, please input "min-max" with the dash "-" (for example 3-7 will give a number between 3 and 7) or it will crash the script. It will bet two times using the base bet that you enter, then makes an addition with the two last bet that you did. For example: Game 1 bet 15 bits Game 2 bet 15 bits Game 3 bet 30 bits Game 4 bet 45 bits Game 5 bet 75 bits Game 6 bet 120 bits And so on, until 3x.

