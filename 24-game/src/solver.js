export default class Solver {
    static checkSolvable(cards, path) {
        if(cards.length === 1) {
            return  {
                solvable: (cards[0].value === 24),
                solution: cards[0].history,
            };
        }

        const ops = ['+', '-', '*', '/'];
        const operate = {
            '+': (a,b) => a+b,
            '*': (a,b) => a*b,
            '-': (a,b) => a-b,
            '/': (a,b) => a/b,
        };

        for(let i = 0; i < cards.length; ++i) {
            for(let j = 0; j < cards.length; ++j) {
                if(i === j) continue;
                const newCards = cards.filter((card, idx) => idx !== i && idx !== j);

                for(let k = 0; k < ops.length; ++k) {
                    let op = ops[k];
                    if(op === '/' && (cards[j].value === 0 || cards[i].value % cards[j].value))
                        continue;

                    const n = operate[op](cards[i].value, cards[j].value);
                    newCards.push({value: n, history: '(' + cards[i].history + op + cards[j].history + ')'});
                    const recAnswer = Solver.checkSolvable(newCards);
                    if(recAnswer.solvable) {
                        return recAnswer;
                    }

                    newCards.pop();
                }
            }
        }

        return {
            solvable: false,
            solution: "",
        };
    }

}
