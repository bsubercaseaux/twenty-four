import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Solver from './solver.js';

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gamesWon: 0,
            bestTime: 1e9,
            sumTime: 0,
            resetBoard: undefined,
            loseMsg: "",
        };
    }

    reset() {
        this.setState({
            gamesWon: 0,
            bestTime: 1e9,
            sumTime: 0,
            loseMsg: "",
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
        console.log("winGame called");
        this.setState({
            gamesWon: this.state.gamesWon+1,
            bestTime: Math.min(newTime, this.state.bestTime),
            sumTime: newTime + this.state.sumTime,
        });
        this.state.resetBoard();
    }

    onLose(msg) {
        this.setState({
            loseMsg: msg
        });
        this.state.blockBoard();
    }

    render() {

        return (
            <div className="centerd" style={{flexDirection: 'column'}}>
                <h1>The famous game of 24</h1>

                <h2> {this.state.loseMsg} </h2>

                <div className="game-board">
                    <Board setBlock={(func) => this.setBlockBoard(func)}
                           setReset={(func) => this.setResetBoard(func)}
                           onWin={(time) => this.winGame(time)}
                           onLose={(msg) => this.onLose(msg)}/>
                </div>


                 <div className="centerd">
                    <button className="reset" onClick={() => this.reset()}>
                        Restart Game
                    </button>
                </div>

                <div className="statistics centerd" style={{flexDirection:'column'}}>
                    <p>Games won: {this.state.gamesWon}</p>
                    <p>Best time: {this.state.bestTime === 1e9 ? "" : this.state.bestTime}</p>
                    <p>Avg time: {this.state.gamesWon ? this.state.sumTime / this.state.gamesWon : ""}</p>
                </div>
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
            cards: Array(4).fill(undefined).map(element=> Math.floor(Math.random()*13+1)),
            clicked: Array(4).fill(0),
            ops: [],
            start: Date.now(),
            blocked: false,
        }

        this.props.setReset(this.reset);
        this.props.setBlock(this.block);

    }

    componentDidMount() {
        document.addEventListener("keypress", this.handleKeyPress, false);
    }

    componentWillUnmount() {
        document.removeEventListener("kepyress", this.handleKeyPress, false);
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
        console.log("checking solvable...");
        const ans = Solver.checkSolvable(this.state.cards, "");
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
            this.setState({ops: ['+', '-', '*', '/']});
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
        cards.push(result);
        const clicked = Array(cards.length).fill(false);
        this.setState({cards, clicked, ops: []});

        console.log("cards: " + this.state.cards);

        if(winning(cards)) {
            console.log("Win :)");
            const time = Date.now() - this.state.start;
            this.props.onWin(time/1000);
        } else {
            console.log("No win :(");
        }
    }

    handleKeyPress = (event) => {
        const ops = ['+', '-', '*', '/'];
        if(event.key >= 1 && event.key <= this.state.cards.length)  {
            this.handleClick(parseInt(event.key)-1);
        } else if(ops.includes(event.key)) {
            this.handleOp(event.key);
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
                    Claim unsolvable
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


