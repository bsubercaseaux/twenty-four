# twenty-four

A simple web version of the game 24.

## Gameplay

The game is structured in post-order notation, this means that 7 - 2 is written instead as `7 2 -`.

You can play with the mouse, by clicking on the two cards you want to operate, and then click on the operation below.

However, I prefer to play with the keyboard, and I get to do better scores with it. To select cards with the keyboard, you can use the numbers 1-4. The number 1 maps to the leftmost card, the number 2 to the following and so on. More in general, to select a card you need to write the 1-index of that card in the screen. Then, you simply need to tap the operation.

When a new card is created, it appears at the rightmost position.

Let's see an example. Imagine the cards are `3 12 1 9`.

If we type `1 4 +`, the cards will be `12 1 12`. Then, by doing `1 2 *`, the cards will be `12 12`, and by typing `1 2 +` we clear the round.
Another solution would be `4 1 / 3 2 - 1 2 *`.


## How to run

To run the game just go into the 24-game folder and do `yarn start`.



