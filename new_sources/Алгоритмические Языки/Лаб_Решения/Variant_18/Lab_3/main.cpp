#include <iostream>

using namespace std;

class Rectangle {
protected:
    double a, b;

public:
    Rectangle(double a, double b) : a(a), b(b) {}

    virtual double calculate() const {
        return a * b;
    }

    virtual void print() const {
        cout << "Прямоугольник:" << endl;
        cout << "  Стороны: a = " << a << ", b = " << b << endl;
        cout << "  Площадь: " << calculate() << endl;
    }

    virtual ~Rectangle() {}
};

class Parallelepiped : public Rectangle {
private:
    double h;

public:
    Parallelepiped(double a, double b, double h) : Rectangle(a, b), h(h) {}

    double calculate() const override {
        return Rectangle::calculate() * h;
    }

    void print() const override {
        Rectangle::print();
        cout << "  Параллелепипед:" << endl;
        cout << "  Высота: h = " << h << endl;
        cout << "  Объём: " << calculate() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Rectangle rect(5.0, 3.0);
    Parallelepiped par(4.0, 6.0, 2.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    rect.print();
    cout << endl;
    par.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Rectangle* ptr_r1 = &rect;
    Rectangle* ptr_r2 = &par;

    cout << "\n[Явный вызов базового метода] ptr_r2->Rectangle::print():" << endl;
    ptr_r2->Rectangle::print();

    cout << "\n[Явный вызов базового calculate()] ptr_r2->Rectangle::calculate():" << endl;
    cout << "  Результат (площадь): " << ptr_r2->Rectangle::calculate() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_r1->print() (указывает на Rectangle):" << endl;
    ptr_r1->print();

    cout << "\nВызов ptr_r2->print() (указывает на Parallelepiped):" << endl;
    ptr_r2->print();

    cout << "\nВызов ptr_r2->calculate() (указывает на Parallelepiped):" << endl;
    cout << "  Результат (объём): " << ptr_r2->calculate() << endl;

    return 0;
}
