#include<bits/stdc++.h>

using namespace std;

vector<string> answer;
vector<char> ops = {'+', '-', '*', '/'};

bool solver(vector<int>& numbers) {
    if(numbers.size() == 1) {
        if(numbers[0] == 24) {
            for(string& s: answer) {
                cout << s << " ";
            } cout << '\n';
            return true;
        }
        return false;
    }

    for(int i = 0; i < numbers.size(); ++i) {
        for(int j = 0; j < numbers.size(); ++j) {
            if(i == j) continue;
            vector<int> next;
            for(int k = 0; k < numbers.size(); ++k) {
                if(k == i or k == j) continue;
                next.push_back(numbers[k]);
            }

            for(char op: ops) {
                int res;
                switch(op) {
                    case '+': {
                        res = numbers[i] + numbers[j];
                        answer.push_back(to_string(i+1) + " " + to_string(j+1) + " +");
                        break;
                    }
                    case '-': {
                        res = numbers[i] - numbers[j];
                        answer.push_back(to_string(i+1) + " " + to_string(j+1) + " -");
                        break;
                    }
                    case '*': {
                        res = numbers[i] * numbers[j];
                        answer.push_back(to_string(i+1) + " " + to_string(j+1) + " *");
                        break;
                    }
                    case '/': {
                        if(numbers[j] == 0 or numbers[i] % numbers[j]) continue;
                        res = numbers[i] / numbers[j];
                        answer.push_back(to_string(i+1) + " " + to_string(j+1) + " /");
                        break;
                    }
                }

                next.push_back(res);

                if(solver(next)) {
                    return true;
                }
                next.pop_back();
                answer.pop_back();

            }

        }
    }
    return false;
}


int main(int argc, const char *argv[])
{
    try {
        if(argc != 5) {
            throw "Error, 4 arguments need to be provided";
        } else {
            vector<int> numbers;
            for(int i = 1; i < argc; ++i) {
                numbers.push_back(stoi(argv[i]));
            }

            if(!solver(numbers)) {
                cout << "No solutions found\n";   
            }
        } 
    } catch(const char* exception) {
        cout << exception << '\n';
    }
    
    
    
    return 0;
}
