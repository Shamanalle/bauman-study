#include <iostream>

using namespace std;

class Point2D {
protected:
    double x, y;

public:
    Point2D(double x, double y) : x(x), y(y) {}

    virtual void print() const {
        cout << "Точка на плоскости (2D):" << endl;
        cout << "  x = " << x << ", y = " << y << endl;
    }

    virtual ~Point2D() {}
};

class Point3D : public Point2D {
private:
    double z;

public:
    Point3D(double x, double y, double z) : Point2D(x, y), z(z) {}

    void print() const override {
        Point2D::print();
        cout << "  Точка в пространстве (3D):" << endl;
        cout << "  z = " << z << endl;
        cout << "  Полные координаты: (" << x << ", " << y << ", " << z << ")" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Point2D p2(3.0, 4.0);
    Point3D p3(1.0, 2.0, 5.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    p2.print();
    cout << endl;
    p3.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Point2D* ptr_p1 = &p2;
    Point2D* ptr_p2 = &p3;

    cout << "\n[Явный вызов базового метода] ptr_p2->Point2D::print():" << endl;
    ptr_p2->Point2D::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_p1->print() (указывает на Point2D):" << endl;
    ptr_p1->print();

    cout << "\nВызов ptr_p2->print() (указывает на Point3D):" << endl;
    ptr_p2->print();

    return 0;
}
