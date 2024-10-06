import Modal from 'react-modal';
import { useState } from 'react';

Modal.setAppElement('#root');
const Help = (props) => {
  console.log("HELP PROPS", props);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  return (
    <div style={{color: 'black'}}>
      <button className="helpBtn" onClick={() => setModalIsOpen(true)}>
        How to play?
      </button>
      <Modal
        className="help-modal"
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Help"
      >
        <p>The goal of the game is to build the number 24 using 4 cards and basic arithmetic operations.</p>
        <p><b>Example with cards (2, 3, 3, 10):</b> (10*3)-(3*2)</p>
        <p>The game is structured in post-order notation, this means that 7 - 2 is written instead as 7 2 -.</p>
        <p>You can play with the mouse, by clicking on the two cards you want to operate, and then click on the operation below.</p>
        <p>However, I prefer to play with the keyboard, and I get to do better scores with it. To select cards with the keyboard, you can use the numbers 1-4. The number 1 maps to the leftmost card, the number 2 to the following and so on. More in general, to select a card you need to write the 1-index of that card in the screen. Then, you simply need to tap the operation.</p>
        <p>When a new card is created, it appears at the rightmost position.</p>
        <p>Let's see an example. Imagine the cards are 3 12 1 9.</p>
        <p>If we type 1 4 +, the cards will be 12 1 12. Then, by doing 1 2 *, the cards will be 12 12, and by typing 1 2 + we clear the round. Another solution would be 4 1 / 3 2 - 1 2 *.</p>
        <div className="centerd">
          <button className="helpBtn closeBtn" onClick={() => setModalIsOpen(false)}> Close help </button>
        </div>
      </Modal>
    </div>
  );
};

export default Help;