# Разбор кода: Лабораторная работа 6 (Вариант 13)

Ниже представлен полный исходный код из `main.cpp`.

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>
#include <stdexcept>
#include <cmath>

using namespace std;

class PrimeException : public invalid_argument {
private:
    int err_value;

public:
    PrimeException(const string& message, int v)
        : invalid_argument(message), err_value(v) {}

    void printErrorData() const {
        cout << "[Детали исключения] Число не является простым:" << endl;
        cout << "  Значение: " << err_value << endl;
    }
};

class PrimeNumber {
private:
    int value;

    bool isPrime(int n) const {
        if (n < 2) return false;
        for (int i = 2; i <= (int)sqrt(n); i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

public:
    PrimeNumber(int v) {
        if (!isPrime(v)) {
            throw PrimeException(
                "Переданное число не является простым!",
                v
            );
        }
        value = v;
    }

    void print() const {
        cout << "Простое число: " << value << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        PrimeNumber p1(17);
        cout << "Объект успешно создан!" << endl;
        p1.print();
    }
    catch (const PrimeException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        PrimeNumber p2(15);

        cout << "Этот текст не напечатается, объект не создан." << endl;
        p2.print();
    }
    catch (const PrimeException& e) {
        cerr << "\nПерехвачено ожидаемое исключение:" << endl;
        cerr << "Сообщение (базовый класс invalid_argument): " << e.what() << endl;
        e.printErrorData();
    }
    catch (const invalid_argument& e) {
        cerr << "invalid_argument перехвачен: " << e.what() << endl;
    }
    catch (const exception& e) {
        cerr << "Произошла неизвестная ошибка: " << e.what() << endl;
    }

    cout << "\nПрограмма успешно завершила свою работу после обработки исключения." << endl;

    return 0;
}

```

---

## 1. Свой класс Исключения
```cpp
class PrimeException : public invalid_argument {{
private:
    int err_value;
```
Наследуем от `invalid_argument` (задание требует этот базовый класс для вариантов 4–9). Поле `err_value` хранит "забракованное" непростое число.

```cpp
    PrimeException(const string& message, int v)
        : invalid_argument(message), err_value(v) {{}}
```
Конструктор вызывает родительский `invalid_argument(message)`.

## 2. Класс PrimeNumber и блок `throw`
```cpp
    bool isPrime(int n) const {{
        if (n < 2) return false;
        for (int i = 2; i <= (int)sqrt(n); i++) {{
            if (n % i == 0) return false;
        }}
        return true;
    }}
```
Метод проверки простоты: перебираем делители от 2 до √n. Если нашёлся хотя бы один — число составное.

```cpp
    PrimeNumber(int v) {{
        if (!isPrime(v)) {{
            throw PrimeException("Число не является простым!", v);
        }}
        value = v;
    }}
```
Конструктор валидирует: если число непростое — `throw`. Объект не создается, стек раскручивается к `catch`.

## 3. Блоки `try - catch`
```cpp
    try {{
        PrimeNumber p2(15);  // 15 = 3 × 5, непростое
        cout << "Этот текст не напечатается";
    }}
    catch (const PrimeException& e) {{
        cerr << e.what() << endl;
        e.printErrorData();  // выведет 15
    }}
```
Ловим `PrimeException` первым, затем `invalid_argument`, затем `exception`. Порядок от специфичного к общему.
