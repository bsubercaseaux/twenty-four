import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';
import ReactCountdownClock from 'react-countdown-clock';
import './index.css';
import Solver from './solver.js';
import { post } from './api.js';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gamesWon: 0,
      bestTime: 45,
      sumTime: 0,
      resets: 0,
      resetBoard: undefined,
      msg: "",
      timeLimit: 45,
      highscore: false,
    };
  }

  reset() {
    this.setState({
      gamesWon: 0,
      resets: this.state.resets+1,
      bestTime: 45,
      sumTime: 0,
      msg: "",
      highscore: false,
    });
    this.state.resetBoard();
  }

  setResetBoard(func) {
    this.setState({resetBoard: func})
  }

  setBlockBoard(func) {
    this.setState({blockBoard: func});
  }

  winGame(newTime) {
    this.setState({
      gamesWon: this.state.gamesWon+1,
      bestTime: Math.min(newTime, this.state.bestTime),
      sumTime: newTime + this.state.sumTime,
    });
    this.state.resetBoard();
  }

  calculateScore() {
    const { gamesWon, bestTime, sumTime, timeLimit } = this.state;
    const avgTime = sumTime / (gamesWon+1);
    console.log("calculating score, rSeconds = " + timeLimit);
    return Math.floor((timeLimit - avgTime)*gamesWon + Math.pow(timeLimit - bestTime, 1.2))/10;
  }

  onLose = (msg) => {
    let score = this.calculateScore();
    this.setState({
      msg,
      score
    });
    this.state.blockBoard();
  }

  handleChange = (event) => {
    this.setState({name: event.target.value});
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const data = { name: this.state.name, score: this.state.score };
    console.log("on submit" + JSON.stringify(data));
    await post('submitScore', data);
    this.setState({ highscore: true});
  }

  render() {
    // const highscores = [10, 42, 42, 10];
    return (
      <div className="centerd" style={{flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
          <h1>The famous game of 24</h1>
          <Help/>
        </div>
        <h2 style={{color: "lightcoral"}}> {this.state.msg} </h2>

        {this.state.msg !== '' &&
            <div>
              <h2 style={{color: "lightcoral"}}> Your score is: {this.state.score}</h2>
            </div>}

            {this.state.msg !== '' && !this.state.highscore &&  <div>
              <form onSubmit={this.handleSubmit}>
                <label>
                  Your name:
                  <input type="text" onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit your score and check highscores!" />
              </form>
            </div>}

        {this.state.highscore &&
          <HighscoreTable/>
        }

        {this.state.msg === '' && <ReactCountdownClock
          key={this.state.gamesWon+this.state.resets}
          seconds={this.state.timeLimit}
          color="#FF1493"
          alpha={0.7}
          size={60}
          onComplete={() => this.onLose("Time is over :(")}
        />}

      {this.state.msg === '' && <div className="game-board">
        <Board setBlock={(func) => this.setBlockBoard(func)}
          setReset={(func) => this.setResetBoard(func)}
          onWin={(time) => this.winGame(time)}
          onLose={(msg) => this.onLose(msg)}/>
      </div>}


      {this.state.msg === '' && <div className="statistics centerd" style={{flexDirection:'column'}}>
        <p className="stats">Rounds won: {this.state.gamesWon}</p>
        <p className="stats">Best time: {this.state.bestTime === 45 ? "" : this.state.bestTime.toFixed(3)}</p>
        <p className="stats">Avg time: {this.state.gamesWon ? (this.state.sumTime / this.state.gamesWon).toFixed(3) : ""}</p>
      </div>}

      <div className="centerd">
        <button className="reset" onClick={() => this.reset()}>
          Restart Game
        </button>
      </div>
    </div>
    );
  }
}

function Help(props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  return (
    <div style={props.style}>
      <button className="help" onClick={() => setModalIsOpen(true)}>
        How to play?
      </button>
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Help"
      >
        <p>The game is structured in post-order notation, this means that 7 - 2 is written instead as 7 2 -.</p>

        <p>You can play with the mouse, by clicking on the two cards you want to operate, and then click on the operation below.</p>

        <p>However, I prefer to play with the keyboard, and I get to do better scores with it. To select cards with the keyboard, you can use the numbers 1-4. The number 1 maps to the leftmost card, the number 2 to the following and so on. More in general, to select a card you need to write the 1-index of that card in the screen. Then, you simply need to tap the operation.</p>

        <p>When a new card is created, it appears at the rightmost position.</p>

        <p>Let's see an example. Imagine the cards are 3 12 1 9.</p>

        <p>If we type 1 4 +, the cards will be 12 1 12. Then, by doing 1 2 *, the cards will be 12 12, and by typing 1 2 + we clear the round. Another solution would be 4 1 / 3 2 - 1 2 *.</p>

        <div className="centerd">
          <button className="help" onClick={() => setModalIsOpen(false)}> Close help </button>
        </div>
      </ReactModal>
    </div>
  );
}

class HighscoreTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  async componentDidMount() {
    const data = await post('getTop', { number: 10});
    this.setState({ data });
  }

  render() {
    return (
      <div style={{fontSize:28}}> The top 10 highest scores are:
        <ul>
          {this.state.data.map((item, index) =>
            <li key={index}>
              {item}
            </li>
          )}
        </ul>
      </div>
    );
  }
}

function Card(props) {
  const className = props.clicked ? "selected-card" : "card";
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Operation(props) {
  return (
    <button className="operation" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function winning(cards) {
  return cards.length === 1 && Math.abs(cards[0] -  24.0) < 0.0001;
}

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      prevCards: [],
      cards: Array(4).fill(undefined).map(element=> Math.floor(Math.random()*13+1)),
      clicked: Array(4).fill(0),
      ops: [],
      start: Date.now(),
      blocked: false,
    }
  }

  componentDidMount() {
    document.addEventListener("keypress", this.handleKeyPress, false);
    this.props.setReset(this.reset);
    this.props.setBlock(this.block);
  }

  componentWillUnmount() {
    document.removeEventListener("kepyress", this.handleKeyPress, false);
    this.props.setReset(()=>{});
    this.props.setBlock(()=>{});
  }

  reset = () => {
    this.setState({
      cards: Array(4).fill(undefined).map(element=> Math.floor(Math.random()*13+1)),
      clicked: Array(4).fill(0),
      ops: [],
      start: Date.now(),
      blocked: false,
    });
  }

  block = () => {
    this.setState({
      blocked: true
    });
  }

  checkSolvable() {
    if(this.state.cards.length !== 4) {
      return;
    }
    const cards = this.state.cards.map(card => {return {value: card, history: "" + card};});
    const ans = Solver.checkSolvable(cards);
    console.log(ans);
    if(ans.solvable === false) {
      const time = Date.now() - this.state.start;
      this.props.onWin(time/1000);
    } else {
      this.props.onLose(":( It was actually solvable! A possible solution is: " + ans.solution);
    }
  }

  handleClick(i) {
    if(this.state.blocked) return;
    const clicked = this.state.clicked.slice();
    const maxTime = Math.max(...clicked);
    clicked[i] = clicked[i] ? 0 : maxTime+1;
    if(clicked.filter(element => element).length === 2) {
      this.setState({ops: ['+', '-', 'x', '/']});
    } else {
      this.setState({ops: []});
    }

    this.setState( {clicked} );
  }

  handleOp(op) {
    if(this.state.blocked) return;
    const ops = {
      '+': (a, b) => a+b,
      '-': (a, b) => a-b,
      'x': (a, b) => a*b,
      '*': (a, b) => a*b,
      '/': (a, b) => a/b,
    }
    const copyCards = this.state.cards.map((card, id) => {return {card: card, id: id}}).filter(card => this.state.clicked[card.id]);
    if(copyCards.length !== 2) return;
    copyCards.sort( (a, b) => this.state.clicked[b.id] - this.state.clicked[a.id]);
    if(op === '/' && (copyCards[0].card === 0 || copyCards[1].card % copyCards[0].card)) {
      return;
    }
    const result = ops[op](copyCards[1].card, copyCards[0].card);
    let cards = this.state.cards.filter((card, i) => !this.state.clicked[i]);
    let prevCards = Array.from(this.state.cards);
    cards.push(result);
    const clicked = Array(cards.length).fill(false);
    this.setState({cards, clicked, ops: [], prevCards});


    if(winning(cards)) {
      const time = Date.now() - this.state.start;
      this.props.onWin(time/1000);
    }
  }

  handleKeyPress = (event) => {
    const ops = ['+', '-', 'x', '/', '*'];
    if(event.key >= 1 && event.key <= this.state.cards.length)  {
      this.handleClick(parseInt(event.key)-1);
    } else if(ops.includes(event.key)) {
      this.handleOp(event.key);
    } else if(event.key === 'z') {
      this.setState({ cards: Array.from(this.state.prevCards) });
    }
  }

  render() {
    return (

      <div className="centerd" style={{flexDirection: 'column'}}>
        <div>
          <div className="card-row">
            {
              this.state.cards.map((card, i) =>
                <Card
                  key={i}
                  value={card}
                  onClick={() => this.handleClick(i)}
                  clicked={this.state.clicked[i]}/>
              )
            }
          </div>
        </div>

        <div className="operations">
          {
            this.state.ops.map(
              op => <Operation
                key={op}
                value={op}
                onClick={() => this.handleOp(op)}/>
            )
          }
        </div>

        <button className="unsolvable" onClick={() => this.checkSolvable()}>
          Claim Unsolvable
        </button>
      </div>
    );
  }
}



// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);


