#include <iostream>
#include <vector>

using namespace std;

class Expression {
private:
    vector<int> numbers;
    vector<char> operations;

public:
    Expression(vector<int> nums, vector<char> ops) {
        numbers = nums;
        operations = ops;
    }

    double evaluate() const {
        if (numbers.empty()) return 0;
        double result = numbers[0];
        for (int i = 0; i < operations.size(); ++i) {
            switch (operations[i]) {
                case '+': result += numbers[i + 1]; break;
                case '-': result -= numbers[i + 1]; break;
                case '*': result *= numbers[i + 1]; break;
                case '/':
                    if (numbers[i + 1] != 0)
                        result /= numbers[i + 1];
                    break;
            }
        }
        return result;
    }

    void print() const {
        for (int i = 0; i < numbers.size(); ++i) {
            cout << numbers[i];
            if (i < operations.size()) cout << " " << operations[i] << " ";
        }
        cout << " = " << evaluate() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Expression> exprs = {
        Expression({10, 5, 3}, {'+', '*'}),
        Expression({20, 4, 2}, {'-', '+'}),
        Expression({7, 3, 2, 1}, {'+', '-', '*'}),
        Expression({100, 25}, {'/'}),
        Expression({8, 2, 3}, {'*', '-'})
    };

    cout << "Все выражения:" << endl;
    for (const auto& e : exprs) {
        e.print();
    }

    cout << "\nРезультаты в обратном порядке:" << endl;
    for (int i = exprs.size() - 1; i >= 0; --i) {
        exprs[i].print();
    }

    return 0;
}
