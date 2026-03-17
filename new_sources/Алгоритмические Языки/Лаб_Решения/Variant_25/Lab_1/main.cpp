#include <iostream>
#include <vector>
#include <string>

using namespace std;

class ExprString {
private:
    string expr;

public:
    ExprString(string e) {
        expr = e;
    }

    int countOperations() const {
        int count = 0;
        for (char c : expr) {
            if (c == '+' || c == '-' || c == '*' || c == '/') {
                count++;
            }
        }
        return count;
    }

    string getExpr() const { return expr; }

    void print() const {
        cout << "Выражение: " << expr
             << ", Операций: " << countOperations() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<ExprString> expressions = {
        ExprString("10+5*3-2"),
        ExprString("100/25"),
        ExprString("7+3-2*4+1"),
        ExprString("42"),
        ExprString("8*2-3+1/2")
    };

    cout << "Все выражения:" << endl;
    for (const auto& e : expressions) {
        e.print();
    }

    int totalOps = 0;
    for (const auto& e : expressions) {
        totalOps += e.countOperations();
    }
    cout << "\nСуммарное количество операций: " << totalOps << endl;

    return 0;
}
