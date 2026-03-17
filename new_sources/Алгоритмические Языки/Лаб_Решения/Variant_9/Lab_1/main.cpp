#include <iostream>
#include <vector>
#include <cmath>

using namespace std;

class Polynomial {
private:
    vector<double> coeffs;

public:
    Polynomial(vector<double> c) {
        coeffs = c;
    }

    double evaluate(double x) const {
        double result = 0;
        for (int i = coeffs.size() - 1; i >= 0; --i) {
            result = result * x + coeffs[i];
        }
        return result;
    }

    int getDegree() const { return coeffs.size() - 1; }

    void print() const {
        cout << "Полином степени " << getDegree() << ": коэфф. =";
        for (double c : coeffs) cout << " " << c;
        cout << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Polynomial> polys = {
        Polynomial({1, -3, 2}),
        Polynomial({5, 0, -2, 1}),
        Polynomial({3, 7}),
        Polynomial({-1, 4, 0, 2}),
        Polynomial({6, -1, 3})
    };

    cout << "Все полиномы:" << endl;
    for (const auto& p : polys) {
        p.print();
    }

    double x;
    cout << "\nВведите значение x: ";
    cin >> x;

    double totalSum = 0;
    cout << "\nЗначения полиномов при x = " << x << ":" << endl;
    for (const auto& p : polys) {
        double val = p.evaluate(x);
        cout << "  P(x) = " << val << endl;
        totalSum += val;
    }
    cout << "\nСумма значений всех полиномов: " << totalSum << endl;

    return 0;
}
