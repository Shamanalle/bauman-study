#include <iostream>

using namespace std;

class Vec2D {
protected:
    double x, y;

public:
    Vec2D(double x, double y) : x(x), y(y) {}

    virtual void print() const {
        cout << "Вектор на плоскости (2D):" << endl;
        cout << "  Координаты: (" << x << ", " << y << ")" << endl;
    }

    virtual ~Vec2D() {}
};

class Vec3D : public Vec2D {
private:
    double z;

public:
    Vec3D(double x, double y, double z) : Vec2D(x, y), z(z) {}

    void print() const override {
        Vec2D::print();
        cout << "  Вектор в пространстве (3D):" << endl;
        cout << "  Координата z = " << z << endl;
        cout << "  Полные координаты: (" << x << ", " << y << ", " << z << ")" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Vec2D v2(3.0, 4.0);
    Vec3D v3(1.0, 2.0, 5.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    v2.print();
    cout << endl;
    v3.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Vec2D* ptr_v1 = &v2;
    Vec2D* ptr_v2 = &v3;

    cout << "\n[Явный вызов базового метода] ptr_v2->Vec2D::print():" << endl;
    ptr_v2->Vec2D::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_v1->print() (указывает на Vec2D):" << endl;
    ptr_v1->print();

    cout << "\nВызов ptr_v2->print() (указывает на Vec3D):" << endl;
    ptr_v2->print();

    return 0;
}
