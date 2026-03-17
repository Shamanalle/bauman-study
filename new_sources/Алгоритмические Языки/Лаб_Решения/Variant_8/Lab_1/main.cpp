#include <iostream>
#include <vector>
#include <cmath>

using namespace std;

class QuadEquation {
private:
    double a, b, c;

public:
    QuadEquation(double pa, double pb, double pc) {
        a = pa;
        b = pb;
        c = pc;
    }

    double getDiscriminant() const {
        return b * b - 4 * a * c;
    }

    bool hasRealRoots() const {
        return getDiscriminant() >= 0;
    }

    double getA() const { return a; }
    double getB() const { return b; }
    double getC() const { return c; }

    void print() const {
        cout << a << "x^2 + " << b << "x + " << c << " = 0"
             << ", D = " << getDiscriminant()
             << (hasRealRoots() ? " (есть корни)" : " (нет корней)") << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<QuadEquation> equations = {
        QuadEquation(1, -3, 2),
        QuadEquation(1, 2, 5),
        QuadEquation(2, -4, 0),
        QuadEquation(1, 0, 1),
        QuadEquation(1, -5, 6)
    };

    cout << "Все уравнения:" << endl;
    for (const auto& eq : equations) {
        eq.print();
    }

    cout << "\nУравнения с вещественными корнями:" << endl;
    bool found = false;
    for (const auto& eq : equations) {
        if (eq.hasRealRoots()) {
            eq.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Таких уравнений не найдено." << endl;
    }

    return 0;
}
