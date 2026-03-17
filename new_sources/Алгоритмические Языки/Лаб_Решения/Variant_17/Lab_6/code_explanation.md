# Разбор кода: Лабораторная работа 6 (Вариант 17)

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>
#include <stdexcept>
#include <cmath>

using namespace std;

class QuadException : public invalid_argument {
private:
    double err_a, err_b, err_c;
    double err_discriminant;

public:
    QuadException(const string& message, double a, double b, double c)
        : invalid_argument(message), err_a(a), err_b(b), err_c(c),
          err_discriminant(b*b - 4*a*c) {}

    void printErrorData() const {
        cout << "[Детали исключения] Уравнение не имеет действительных корней:" << endl;
        cout << "  a = " << err_a << ", b = " << err_b << ", c = " << err_c << endl;
        cout << "  Дискриминант D = " << err_discriminant << " < 0" << endl;
    }
};

class QuadEquation {
private:
    double a, b, c;
    double x1, x2;

public:
    QuadEquation(double pa, double pb, double pc) : a(pa), b(pb), c(pc) {
        double D = b * b - 4 * a * c;
        if (D < 0) {
            throw QuadException(
                "Квадратное уравнение не имеет действительных корней (D < 0)!",
                a, b, c
            );
        }
        x1 = (-b + sqrt(D)) / (2 * a);
        x2 = (-b - sqrt(D)) / (2 * a);
    }

    void print() const {
        cout << "Уравнение: " << a << "x² + " << b << "x + " << c << " = 0" << endl;
        cout << "  x1 = " << x1 << ", x2 = " << x2 << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        QuadEquation eq1(1, -3, 2);
        cout << "Объект успешно создан!" << endl;
        eq1.print();
    }
    catch (const QuadException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        QuadEquation eq2(1, 2, 5);

        cout << "Этот текст не напечатается." << endl;
        eq2.print();
    }
    catch (const QuadException& e) {
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
class QuadException : public invalid_argument {{
private:
    double err_a, err_b, err_c;
    double err_discriminant;
```
Наследник `invalid_argument`. Хранит коэффициенты и дискриминант "забракованного" уравнения.

```cpp
    QuadException(const string& message, double a, double b, double c)
        : invalid_argument(message), err_a(a), err_b(b), err_c(c),
          err_discriminant(b*b - 4*a*c) {{}}
```
Дискриминант вычисляется прямо в конструкторе исключения — удобно для отладки.

## 2. Класс QuadEquation и `throw`
```cpp
    QuadEquation(double pa, double pb, double pc) : a(pa), b(pb), c(pc) {{
        double D = b * b - 4 * a * c;
        if (D < 0) {{
            throw QuadException("D < 0!", a, b, c);
        }}
        x1 = (-b + sqrt(D)) / (2 * a);
        x2 = (-b - sqrt(D)) / (2 * a);
    }}
```
Конструктор вычисляет дискриминант D = b² − 4ac. Если D < 0 — действительных корней нет, `throw`. Если D ≥ 0 — вычисляются корни по формуле.

## 3. Блоки `try - catch`
```cpp
    try {{
        QuadEquation eq2(1, 2, 5);  // D = 4 - 20 = -16 < 0
    }}
    catch (const QuadException& e) {{
        e.printErrorData();  // покажет a=1, b=2, c=5, D=-16
    }}
```
Ловим `QuadException` первым, затем `invalid_argument`, затем `exception`.
