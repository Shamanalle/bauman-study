#include <iostream>

using namespace std;

class Square {
protected:
    double side;

public:
    Square(double s) : side(s) {}

    virtual double perimeter() const {
        return 4 * side;
    }

    virtual void print() const {
        cout << "Квадрат:" << endl;
        cout << "  Сторона: " << side << endl;
        cout << "  Периметр: " << perimeter() << endl;
    }

    virtual ~Square() {}
};

class RectangleD : public Square {
private:
    double side2;

public:
    RectangleD(double a, double b) : Square(a), side2(b) {}

    double perimeter() const override {
        return 2 * (side + side2);
    }

    void print() const override {
        cout << "Прямоугольник:" << endl;
        cout << "  Сторона a: " << side << endl;
        cout << "  Сторона b: " << side2 << endl;
        cout << "  Периметр: " << perimeter() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Square sq(5.0);
    RectangleD rect(4.0, 6.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    sq.print();
    cout << endl;
    rect.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Square* ptr_s1 = &sq;
    Square* ptr_s2 = &rect;

    cout << "\n[Явный вызов базового метода] ptr_s2->Square::print():" << endl;
    ptr_s2->Square::print();

    cout << "\n[Явный вызов базового perimeter()] ptr_s2->Square::perimeter():" << endl;
    cout << "  Результат (периметр квадрата): " << ptr_s2->Square::perimeter() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_s1->print() (указывает на Square):" << endl;
    ptr_s1->print();

    cout << "\nВызов ptr_s2->print() (указывает на RectangleD):" << endl;
    ptr_s2->print();

    cout << "\nВызов ptr_s2->perimeter() (указывает на RectangleD):" << endl;
    cout << "  Результат (периметр прямоугольника): " << ptr_s2->perimeter() << endl;

    return 0;
}
