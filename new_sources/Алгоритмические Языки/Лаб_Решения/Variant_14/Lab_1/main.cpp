#include <iostream>
#include <vector>
#include <string>
#include <cmath>

using namespace std;

class RealNumber {
private:
    double value;
    string repr;

public:
    RealNumber(double v, string r) {
        value = v;
        repr = r;
    }

    int intPartDigits() const {
        string s = repr;
        size_t dotPos = s.find('.');
        if (dotPos == string::npos) return s.length();
        string intPart = s.substr(0, dotPos);
        if (intPart[0] == '-') intPart = intPart.substr(1);
        return intPart.length();
    }

    double getValue() const { return value; }
    string getRepr() const { return repr; }

    void print() const {
        cout << "Число: " << repr
             << " (значение: " << value
             << ", цифр в целой части: " << intPartDigits() << ")" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<RealNumber> numbers = {
        RealNumber(123.456, "123.456"),
        RealNumber(7.89, "7.89"),
        RealNumber(1000.1, "1000.1"),
        RealNumber(0.55, "0.55"),
        RealNumber(42.0, "42.0")
    };

    cout << "Все числа:" << endl;
    for (const auto& n : numbers) {
        n.print();
    }

    double totalSum = 0;
    int totalDigits = 0;
    for (const auto& n : numbers) {
        totalSum += n.getValue();
        totalDigits += n.intPartDigits();
    }

    cout << "\nСумма чисел: " << totalSum << endl;
    cout << "Суммарное количество цифр в целых частях: " << totalDigits << endl;

    return 0;
}
