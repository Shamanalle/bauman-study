#include <iostream>
#include <string>

using namespace std;

class Car {
protected:
    string model;
    double maxSpeed;

public:
    Car(string m, double s) : model(m), maxSpeed(s) {}

    virtual void print() const {
        cout << "Автомобиль:" << endl;
        cout << "  Модель: " << model << endl;
        cout << "  Макс. скорость: " << maxSpeed << " км/ч" << endl;
    }

    virtual ~Car() {}
};

class Bus : public Car {
private:
    int maxPassengers;

public:
    Bus(string m, double s, int p) : Car(m, s), maxPassengers(p) {}

    void print() const override {
        Car::print();
        cout << "  Тип: Автобус" << endl;
        cout << "  Макс. пассажиров: " << maxPassengers << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Car car("Toyota Camry", 210);
    Bus bus("ЛиАЗ-5292", 80, 110);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    car.print();
    cout << endl;
    bus.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Car* ptr_c1 = &car;
    Car* ptr_c2 = &bus;

    cout << "\n[Явный вызов базового метода] ptr_c2->Car::print():" << endl;
    ptr_c2->Car::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_c1->print() (указывает на Car):" << endl;
    ptr_c1->print();

    cout << "\nВызов ptr_c2->print() (указывает на Bus):" << endl;
    ptr_c2->print();

    return 0;
}
