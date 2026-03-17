#include <iostream>

using namespace std;

class Square {
protected:
    double side;

public:
    Square(double s) : side(s) {}

    virtual double calculate() const {
        return side * side;
    }

    virtual void print() const {
        cout << "Квадрат:" << endl;
        cout << "  Сторона: " << side << endl;
        cout << "  Площадь: " << calculate() << endl;
    }

    virtual ~Square() {}
};

class Cube : public Square {
public:
    Cube(double s) : Square(s) {}

    double calculate() const override {
        return Square::calculate() * side;
    }

    void print() const override {
        cout << "Куб:" << endl;
        cout << "  Сторона: " << side << endl;
        cout << "  Площадь одной грани: " << Square::calculate() << endl;
        cout << "  Объём: " << calculate() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Square sq(5.0);
    Cube cu(3.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    sq.print();
    cout << endl;
    cu.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Square* ptr_s1 = &sq;
    Square* ptr_s2 = &cu;

    cout << "\n[Явный вызов базового метода] ptr_s2->Square::print():" << endl;
    ptr_s2->Square::print();

    cout << "\n[Явный вызов базового calculate()] ptr_s2->Square::calculate():" << endl;
    cout << "  Результат (площадь квадрата): " << ptr_s2->Square::calculate() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_s1->print() (указывает на Square):" << endl;
    ptr_s1->print();

    cout << "\nВызов ptr_s2->print() (указывает на Cube):" << endl;
    ptr_s2->print();

    cout << "\nВызов ptr_s2->calculate() (указывает на Cube):" << endl;
    cout << "  Результат (объём куба): " << ptr_s2->calculate() << endl;

    return 0;
}
