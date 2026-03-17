#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Car {
private:
    string brand;
    double maxSpeed;

public:
    Car(string b, double s) {
        brand = b;
        maxSpeed = s;
    }

    string getBrand() const { return brand; }
    double getMaxSpeed() const { return maxSpeed; }

    void print() const {
        cout << "Марка: " << brand
             << ", Макс. скорость: " << maxSpeed << " км/ч" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Car> cars = {
        Car("BMW M5", 305),
        Car("Toyota Corolla", 180),
        Car("Mercedes-AMG", 320),
        Car("Lada Vesta", 180),
        Car("Porsche 911", 330)
    };

    cout << "Все автомобили:" << endl;
    for (const auto& c : cars) {
        c.print();
    }

    double minSpeed;
    cout << "\nВведите минимальную скорость (км/ч): ";
    cin >> minSpeed;

    cout << "\nАвтомобили со скоростью > " << minSpeed << " км/ч:" << endl;
    bool found = false;
    for (const auto& c : cars) {
        if (c.getMaxSpeed() > minSpeed) {
            c.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Таких автомобилей не найдено." << endl;
    }

    return 0;
}
