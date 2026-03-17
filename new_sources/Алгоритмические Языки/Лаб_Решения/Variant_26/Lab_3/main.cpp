#include <iostream>
#include <cmath>

using namespace std;

const double PI = 3.14159265358979;

class Circle {
protected:
    double r;

public:
    Circle(double r) : r(r) {}

    virtual void print() const {
        cout << "Круг:" << endl;
        cout << "  Радиус: " << r << endl;
        cout << "  Площадь: " << PI * r * r << endl;
    }

    virtual ~Circle() {}
};

class Ellipse : public Circle {
private:
    double b;

public:
    Ellipse(double a, double b) : Circle(a), b(b) {}

    void print() const override {
        Circle::print();
        cout << "  Эллипс:" << endl;
        cout << "  Полуось a (из базового): " << r << endl;
        cout << "  Полуось b: " << b << endl;
        cout << "  Площадь эллипса: " << PI * r * b << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Circle ci(5.0);
    Ellipse el(4.0, 2.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    ci.print();
    cout << endl;
    el.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Circle* ptr_c1 = &ci;
    Circle* ptr_c2 = &el;

    cout << "\n[Явный вызов базового метода] ptr_c2->Circle::print():" << endl;
    ptr_c2->Circle::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_c1->print() (указывает на Circle):" << endl;
    ptr_c1->print();

    cout << "\nВызов ptr_c2->print() (указывает на Ellipse):" << endl;
    ptr_c2->print();

    return 0;
}
