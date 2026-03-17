#include <iostream>
#include <cmath>

using namespace std;

class RealNumber {
protected: 
    double value; 

public:
    RealNumber(double val) : value(val) {}

    virtual double absValue() const {
        return abs(value);
    }

    virtual void print() const {
        cout << "Вещественное число:" << endl;
        cout << "  Значение: " << value << endl;
        cout << "  Модуль: " << absValue() << endl;
    }
    
    virtual ~RealNumber() {}
};

class ComplexNumber : public RealNumber {
private:
    double imaginary; 

public:
    ComplexNumber(double real, double imag) 
        : RealNumber(real), imaginary(imag) {} 

    double absValue() const override {
        return sqrt(value * value + imaginary * imaginary);
    }

    void print() const override {
        cout << "Комплексное число:" << endl;
        cout << "  Действительная часть: " << value << endl;
        cout << "  Мнимая часть: " << imaginary << endl;
        cout << "  Формат: " << value << (imaginary >= 0 ? " + " : " - ") << abs(imaginary) << "i" << endl;
        cout << "  Модуль: " << absValue() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    RealNumber r(-5.5);
    ComplexNumber c(3.0, -4.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    r.print();
    cout << endl;
    c.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    RealNumber* ptr_r1 = &r;
    RealNumber* ptr_r2 = &c;

    cout << "\n[Явный вызов базового метода] ptr_r2->RealNumber::print():" << endl;
    ptr_r2->RealNumber::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_r1->print() (указывает на RealNumber):" << endl;
    ptr_r1->print();

    cout << "\nВызов ptr_r2->print() (указывает на ComplexNumber):" << endl;
    ptr_r2->print();

    return 0;
}
