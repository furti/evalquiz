Here's an example of how to weight the whole first sack:

    var m = weight(sacks[0]);

The variable `m` then holds the mass of the sack. 

You can also take some coins out of the sack:

    var coins = sacks[0].getCoins(10);
    
The variable `coins` holds an array with 10 `Coin` objects. The coins 
do not offer any properties or functions themself, but you can 
weight them:

    var m = weight(coins);

The variable `m` then holds the mass of the coins.

If you think, the first sack contains the coins, you return it like this:

    return sacks[0];


**And before you ask:** No, you cannot put coins back into a sack.

To solve the riddle, the array functions may help you. Check out the 
[documentation](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array).
