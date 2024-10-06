import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Help from './HelpModal.jsx';
import CountdownClock from './CountDown.jsx';
// import './index.css';
import './App.css';
import Solver from './solver.js';
import { post } from './api.js';

const Game = () => {
  const [gameState, setGameState] = useState({
    gamesWon: 0,
    bestTime: 45,
    sumTime: 0,
    resets: 0,
    msg: "",
    timeLimit: 45,
    highscore: false,
    score: 0,
    name: "",
  });

  const [resetBoard, setResetBoard] = useState(() => { });
  const [blockBoard, setBlockBoard] = useState(() => { });

  const reset = () => {
    setGameState(prevState => ({
      ...prevState,
      gamesWon: 0,
      resets: prevState.resets + 1,
      bestTime: 45,
      sumTime: 0,
      msg: "",
      highscore: false,
    }));
    resetBoard();
  };

  const winGame = (newTime) => {
    setGameState(prevState => ({
      ...prevState,
      gamesWon: prevState.gamesWon + 1,
      bestTime: Math.min(newTime, prevState.bestTime),
      sumTime: newTime + prevState.sumTime,
    }));
    resetBoard();
  };

  const calculateScore = () => {
    const { gamesWon, bestTime, sumTime, timeLimit } = gameState;
    const avgTime = sumTime / (gamesWon + 1);
    return Math.floor((timeLimit - avgTime) * gamesWon + Math.pow(timeLimit - bestTime, 1.2)) / 10;
  };

  const onLose = useCallback((msg) => {
    const score = calculateScore();
    setGameState(prevState => ({ ...prevState, msg, score }));
    blockBoard();
  }, [blockBoard]);

  const handleChange = (event) => {
    setGameState(prevState => ({ ...prevState, name: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = { name: gameState.name, score: gameState.score };
    await post('submitScore', data);
    setGameState(prevState => ({ ...prevState, highscore: true }));
  };

  return (
    <div className="centerd" style={{ flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
        <h1>The famous game of 24</h1>
        <Help style={{color: 'black'}}/>
      </div>
      <h2 style={{ color: "lightcoral" }}> {gameState.msg} </h2>

      {gameState.msg !== '' && (
        <div>
          <h2 style={{ color: "lightcoral" }}> Your score is: {gameState.score}</h2>
        </div>
      )}

      {/* {gameState.msg !== '' && !gameState.highscore && (
        <div>
          <form onSubmit={handleSubmit}>
            <label>
              Your name:
              <input type="text" onChange={handleChange} />
            </label>
            <input type="submit" value="Submit your score and check highscores!" />
          </form>
        </div>
      )} */}

      {/* {gameState.highscore && <HighscoreTable />} */}

      {gameState.msg === '' && (
        <CountdownClock
          key={gameState.gamesWon + gameState.resets}
          seconds={gameState.timeLimit}
          onComplete={() => onLose("Time is over :(")}
        />
      )}

      {gameState.msg === '' && (
        <div className="game-board">
          <Board
            setBlock={setBlockBoard}
            setReset={setResetBoard}
            onWin={winGame}
            onLose={onLose}
          />
        </div>
      )}

      {gameState.msg === '' && (
        <div className="statistics centerd" style={{ flexDirection: 'column' }}>
          <p className="stats">Rounds won: {gameState.gamesWon}</p>
          <p className="stats">Best time: {gameState.bestTime === 45 ? "" : gameState.bestTime.toFixed(3)}</p>
          <p className="stats">Avg time: {gameState.gamesWon ? (gameState.sumTime / gameState.gamesWon).toFixed(3) : ""}</p>
        </div>
      )}

      <div className="centerd">
        <button className="reset" onClick={reset}>
          Restart Game
        </button>
      </div>
    </div>
  );
};



const HighscoreTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await post('getTop', { number: 10 });
      setData(result);
    };
    fetchData();
  }, []);

  return (
    <div style={{ fontSize: 28 }}> The top 10 highest scores are:
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const Card = ({ value, onClick, clicked }) => {
  const className = clicked ? "selected-card" : "card";
  return (
    <button className={className} onClick={onClick}>
      {value}
    </button>
  );
};

const Operation = ({ value, onClick }) => {
  return (
    <button className="operation" onClick={onClick}>
      {value}
    </button>
  );
};

const winning = (cards) => {
  return cards.length === 1 && Math.abs(cards[0] - 24.0) < 0.0001;
};

const Board = ({ setBlock, setReset, onWin, onLose }) => {
  const [gameState, setGameState] = useState({
    prevCards: [],
    cards: [],
    clicked: [],
    ops: [],
    start: Date.now(),
    blocked: false,
  });

  const produceCardArray = (n) => {
    let deck = Array(52).fill(undefined).map((_, index) => (index % 13) + 1);
    let answer = [];
    while (answer.length < n && deck.length > 0) {
      let index = Math.floor(Math.random() * deck.length);
      answer.push(deck[index]);
      deck.splice(index, 1);
    }
    return answer;
  };

  const reset = useCallback(() => {
    const cardArray = produceCardArray(4);
    setGameState({
      prevCards: Array.from(cardArray),
      cards: Array.from(cardArray),
      clicked: Array(4).fill(0),
      ops: [],
      start: Date.now(),
      blocked: false,
    });
  }, []);

  useEffect(() => {
    reset();
    setReset(() => reset);
    setBlock(() => () => setGameState(prev => ({ ...prev, blocked: true })));
  }, [setReset, setBlock, reset]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const ops = ['+', '-', 'x', '/', '*'];
      if (event.key >= 1 && event.key <= gameState.cards.length) {
        handleClick(parseInt(event.key) - 1);
      } else if (ops.includes(event.key)) {
        handleOp(event.key);
      } else if (event.key === 'z') {
        setGameState(prev => ({ ...prev, cards: Array.from(prev.prevCards) }));
      }
    };

    document.addEventListener("keypress", handleKeyPress);
    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, [gameState]);

  const checkSolvable = () => {
    if (gameState.cards.length !== 4) {
      return;
    }
    const cards = gameState.cards.map(card => ({ value: card, history: "" + card }));
    const ans = Solver.checkSolvable(cards);
    console.log(ans);
    if (ans.solvable === false) {
      const time = Date.now() - gameState.start;
      onWin(time / 1000);
    } else {
      onLose("It was actually solvable! A possible solution is: " + ans.solution);
    }
  };

  const handleClick = (i) => {
    if (gameState.blocked) return;
    setGameState(prev => {
      const clicked = [...prev.clicked];
      const maxTime = Math.max(...clicked);
      clicked[i] = clicked[i] ? 0 : maxTime + 1;
      const ops = clicked.filter(element => element).length === 2 ? ['+', '−', '×', '÷'] : [];
      return { ...prev, clicked, ops };
    });
  };

  const handleOp = (op) => {
    if (gameState.blocked) return;
    const ops = {
      '+': (a, b) => a + b,
      '-': (a, b) => a - b,
      'x': (a, b) => a * b,
      '×': (a, b) => a * b,
      '*': (a, b) => a * b,
      '/': (a, b) => a / b,
    };
    setGameState(prev => {
      const copyCards = prev.cards.map((card, id) => ({ card, id })).filter(card => prev.clicked[card.id]);
      if (copyCards.length !== 2) return prev;
      copyCards.sort((a, b) => prev.clicked[b.id] - prev.clicked[a.id]);
      if (op === '/' && (copyCards[0].card === 0 || copyCards[1].card % copyCards[0].card)) {
        return prev;
      }
      const result = ops[op](copyCards[1].card, copyCards[0].card);
      const cards = prev.cards.filter((_, i) => !prev.clicked[i]);
      cards.push(result);
      const clicked = Array(cards.length).fill(false);
      const newState = { ...prev, cards, clicked, ops: [], prevCards: Array.from(prev.cards) };

      if (winning(cards)) {
        const time = Date.now() - prev.start;
        onWin(time / 1000);
      }

      return newState;
    });
  };

  return (
    <div className="centerd" style={{ flexDirection: 'column' }}>
      <div>
        <div className="card-row">
          {gameState.cards.map((card, i) => (
            <Card
              key={i}
              value={card}
              onClick={() => handleClick(i)}
              clicked={gameState.clicked[i]}
            />
          ))}
        </div>
      </div>

      <div className="operations">
        {gameState.ops.map(op => (
          <Operation
            key={op}
            value={op}
            onClick={() => handleOp(op)}
          />
        ))}
      </div>

      <button className="unsolvable" onClick={checkSolvable}>
        Claim Unsolvable
      </button>
    </div>
  );
};

export default Game;