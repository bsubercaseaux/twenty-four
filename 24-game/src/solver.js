export default class Solver {
    static checkSolvable(cards, path) {
        if(cards.length === 1) {
            return  {
                solvable: (cards[0] === 24),
                solution: path
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
                    if(op === '/' && (cards[j] === 0 || cards[i] % cards[j]))
                        continue;

                    const n = operate[op](cards[i], cards[j]);
                    newCards.push(n);

                    const newPath = path + (i+1) + " " + (j+1) + " " + op + "|";
                    const recAnswer = Solver.checkSolvable(newCards, newPath);
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
