#include <iostream>
#include <vector>

using namespace std;

class Hangar {
private:
    double width;
    double length;

public:
    Hangar(double w, double l) {
        width = w;
        length = l;
    }

    double getArea() const {
        return width * length;
    }

    double getWidth() const { return width; }
    double getLength() const { return length; }

    void print() const {
        cout << "Ширина: " << width
             << ", Длина: " << length
             << ", Площадь: " << getArea() << " кв.м" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Hangar> hangars = {
        Hangar(20.0, 30.0),
        Hangar(15.0, 25.0),
        Hangar(10.0, 40.0),
        Hangar(25.0, 35.0),
        Hangar(18.0, 22.0)
    };

    cout << "Все ангары:" << endl;
    for (const auto& h : hangars) {
        h.print();
    }

    double totalArea = 0;
    for (const auto& h : hangars) {
        totalArea += h.getArea();
    }
    cout << "\nОбщая площадь склада: " << totalArea << " кв.м" << endl;

    return 0;
}
