# Разбор кода: Лабораторная работа 6 (Вариант 27)

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>
#include <stdexcept>
#include <cmath>

using namespace std;

class TriangleException : public invalid_argument {
private:
    double err_a, err_b, err_c;

public:
    TriangleException(const string& message, double a, double b, double c)
        : invalid_argument(message), err_a(a), err_b(b), err_c(c) {}

    void printErrorData() const {
        cout << "[Детали исключения] Треугольник не существует:" << endl;
        cout << "  a = " << err_a << ", b = " << err_b << ", c = " << err_c << endl;
        cout << "  Нарушено неравенство: каждая сторона должна быть < суммы двух других" << endl;
    }
};

class Triangle {
private:
    double a, b, c;

    bool isValid() const {
        return (a + b > c) && (a + c > b) && (b + c > a) && a > 0 && b > 0 && c > 0;
    }

public:
    Triangle(double pa, double pb, double pc) : a(pa), b(pb), c(pc) {
        if (!isValid()) {
            throw TriangleException(
                "С заданными длинами сторон треугольник не существует!",
                a, b, c
            );
        }
    }

    double area() const {
        double s = (a + b + c) / 2.0;
        return sqrt(s * (s - a) * (s - b) * (s - c));
    }

    void print() const {
        cout << "Треугольник: a=" << a << ", b=" << b << ", c=" << c << endl;
        cout << "  Площадь (формула Герона): " << area() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        Triangle t1(3, 4, 5);
        cout << "Объект успешно создан!" << endl;
        t1.print();
    }
    catch (const TriangleException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        Triangle t2(1, 2, 10);

        cout << "Этот текст не напечатается." << endl;
        t2.print();
    }
    catch (const TriangleException& e) {
        cerr << "\nПерехвачено ожидаемое исключение:" << endl;
        cerr << "Сообщение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const invalid_argument& e) {
        cerr << "invalid_argument: " << e.what() << endl;
    }
    catch (const exception& e) {
        cerr << "Неизвестная ошибка: " << e.what() << endl;
    }

    cout << "\nПрограмма успешно завершила свою работу." << endl;
    return 0;
}

```

---

## 1. Свой класс Исключения
```cpp
class TriangleException : public invalid_argument {{
private:
    double err_a, err_b, err_c;
```
Наследник `invalid_argument`. Хранит длины сторон "невозможного" треугольника.

## 2. Класс Triangle и `throw`
```cpp
    bool isValid() const {{
        return (a + b > c) && (a + c > b) && (b + c > a) && a > 0 && b > 0 && c > 0;
    }}
```
**Неравенство треугольника**: каждая сторона должна быть строго меньше суммы двух других. Также все стороны должны быть положительными.

```cpp
    Triangle(double pa, double pb, double pc) : a(pa), b(pb), c(pc) {{
        if (!isValid()) throw TriangleException("Не существует!", a, b, c);
    }}
```

```cpp
    double area() const {{
        double s = (a + b + c) / 2.0;
        return sqrt(s * (s - a) * (s - b) * (s - c));
    }}
```
Площадь вычисляется по **формуле Герона**: S = √(p(p−a)(p−b)(p−c)), где p — полупериметр.

## 3. Блоки `try - catch`
```cpp
    try {{
        Triangle t2(1, 2, 10);  // 1+2=3 < 10 — не существует
    }}
    catch (const TriangleException& e) {{
        e.printErrorData();  // покажет a=1, b=2, c=10
    }}
```
Порядок: `TriangleException` → `invalid_argument` → `exception`.
