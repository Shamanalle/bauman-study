#include <iostream>
#include <vector>
#include <cmath>

using namespace std;

class Vector2D {
private:
    double x, y;

public:
    Vector2D(double px, double py) {
        x = px;
        y = py;
    }

    double getLength() const {
        return sqrt(x * x + y * y);
    }

    double getX() const { return x; }
    double getY() const { return y; }

    void print() const {
        cout << "Вектор (" << x << ", " << y << ")"
             << ", Длина: " << getLength() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Vector2D> vectors = {
        Vector2D(3.0, 4.0),
        Vector2D(1.0, 1.0),
        Vector2D(5.0, 12.0),
        Vector2D(-2.0, 7.0),
        Vector2D(8.0, 6.0)
    };

    cout << "Все вектора:" << endl;
    for (const auto& v : vectors) {
        v.print();
    }

    double maxLen = 0;
    int maxIdx = 0;
    for (int i = 0; i < vectors.size(); ++i) {
        if (vectors[i].getLength() > maxLen) {
            maxLen = vectors[i].getLength();
            maxIdx = i;
        }
    }

    cout << "\nВектор с наибольшей длиной:" << endl;
    vectors[maxIdx].print();

    return 0;
}
