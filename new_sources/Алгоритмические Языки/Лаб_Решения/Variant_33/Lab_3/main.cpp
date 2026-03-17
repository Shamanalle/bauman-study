#include <iostream>
#include <cmath>

using namespace std;

const double PI = 3.14159265358979;

class Circle {
protected:
    double r;

public:
    Circle(double r) : r(r) {}

    virtual double calculate() const {
        return PI * r * r;
    }

    virtual void print() const {
        cout << "Круг:" << endl;
        cout << "  Радиус: " << r << endl;
        cout << "  Площадь: " << calculate() << endl;
    }

    virtual ~Circle() {}
};

class Sphere : public Circle {
public:
    Sphere(double r) : Circle(r) {}

    double calculate() const override {
        return (4.0 / 3.0) * PI * r * r * r;
    }

    void print() const override {
        cout << "Шар:" << endl;
        cout << "  Радиус: " << r << endl;
        cout << "  Площадь круга (сечение): " << Circle::calculate() << endl;
        cout << "  Объём шара: " << calculate() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Circle ci(5.0);
    Sphere sp(3.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    ci.print();
    cout << endl;
    sp.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Circle* ptr_c1 = &ci;
    Circle* ptr_c2 = &sp;

    cout << "\n[Явный вызов базового метода] ptr_c2->Circle::print():" << endl;
    ptr_c2->Circle::print();

    cout << "\n[Явный вызов базового calculate()] ptr_c2->Circle::calculate():" << endl;
    cout << "  Результат (площадь круга): " << ptr_c2->Circle::calculate() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_c1->print() (указывает на Circle):" << endl;
    ptr_c1->print();

    cout << "\nВызов ptr_c2->print() (указывает на Sphere):" << endl;
    ptr_c2->print();

    cout << "\nВызов ptr_c2->calculate() (указывает на Sphere):" << endl;
    cout << "  Результат (объём шара): " << ptr_c2->calculate() << endl;

    return 0;
}
