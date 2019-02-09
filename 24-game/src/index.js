import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gamesWon: 0,
            bestTime: 1e9,
            sumTime: 0
        };
    }

    winGame(newTime) {
        console.log("winGame called");
        this.setState({
            gamesWon: this.state.gamesWon+1,
            bestTime: Math.min(newTime, this.state.bestTime),
            sumTime: newTime + this.state.sumTime,
        });
    }

    render() {
        return (
            <div className="centerd" style={{flexDirection: 'column'}}>
                <h1>The famous game of 24</h1>
                <div className="game-board">
                    <Board
                        gamesWon={this.state.gamesWon}
                        bestTime={this.state.bestTime === 1e9 ? "No scores yet" : this.state.bestTime}
                        avgTime={this.state.gamesWon && this.state.sumTime / this.state.gamesWon}
                        onWin={(time) => this.winGame(time)}
                    />
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
        }
    }

    reset() {
        this.setState({
            cards: Array(4).fill(undefined).map(element=> Math.floor(Math.random()*13+1)),
            clicked: Array(4).fill(0),
            ops: [],
            start: Date.now(),
        });
    }

    handleClick(i) {
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
        const ops = {
            '+': (a, b) => a+b,
            '-': (a, b) => a-b,
            '*': (a, b) => a*b,
            '/': (a, b) => b && a/b,
        }
        const copyCards = this.state.cards.map((card, id) => {return {card: card, id: id}});
        copyCards.sort( (a, b) => this.state.clicked[b.id] - this.state.clicked[a.id]);
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

    render() {
        const status = winning(this.state.cards) ? "Congratulations, you won! :)" : "";
        return (

            <div>
                <h1>{status}</h1>
                <div className="centerd">
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

                <div className="centerd">
                    <button className="reset" onClick={() => this.reset()}>
                        Restart Game
                    </button>
                </div>

                <div className="statistics centerd" style={{flexDirection:'column'}}>
                    <p>Games won: {this.props.gamesWon}</p>
                    <p>Best time: {this.props.bestTime}</p>
                    <p>Avg time: {this.props.avgTime}</p>
                </div>
            </div>
        );
    }
}



// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);


