#include <iostream>
#include <cmath>

using namespace std;

class Vector2D {
protected:
    double x, y;

public:
    Vector2D(double x, double y) : x(x), y(y) {}

    virtual double length() const {
        return sqrt(x * x + y * y);
    }

    virtual void print() const {
        cout << "Вектор на плоскости (2D):" << endl;
        cout << "  Координаты: (" << x << ", " << y << ")" << endl;
        cout << "  Длина: " << length() << endl;
    }

    virtual ~Vector2D() {}
};

class Vector3D : public Vector2D {
private:
    double z;

public:
    Vector3D(double x, double y, double z) : Vector2D(x, y), z(z) {}

    double length() const override {
        return sqrt(x * x + y * y + z * z);
    }

    void print() const override {
        cout << "Вектор в пространстве (3D):" << endl;
        cout << "  Координаты: (" << x << ", " << y << ", " << z << ")" << endl;
        cout << "  Длина 2D-проекции: " << Vector2D::length() << endl;
        cout << "  Длина 3D: " << length() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Vector2D v2(3.0, 4.0);
    Vector3D v3(1.0, 2.0, 2.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    v2.print();
    cout << endl;
    v3.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Vector2D* ptr_v1 = &v2;
    Vector2D* ptr_v2 = &v3;

    cout << "\n[Явный вызов базового метода] ptr_v2->Vector2D::print():" << endl;
    ptr_v2->Vector2D::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_v1->print() (указывает на Vector2D):" << endl;
    ptr_v1->print();

    cout << "\nВызов ptr_v2->print() (указывает на Vector3D):" << endl;
    ptr_v2->print();

    cout << "\nВызов ptr_v2->length() (указывает на Vector3D):" << endl;
    cout << "  Длина = " << ptr_v2->length() << endl;

    return 0;
}
