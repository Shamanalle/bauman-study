# Разбор кода: Лабораторная работа 6 (Вариант 2)

Ниже представлен полный исходный код из `main.cpp`.
В последующих разделах этот код разбит на логические блоки с детальным объяснением механизма исключений.

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>
#include <stdexcept>

using namespace std;

class DateException : public out_of_range {
private:
    int err_day;
    int err_month;
    int err_year;

public:
    DateException(const string& message, int d, int m, int y)
        : out_of_range(message), err_day(d), err_month(m), err_year(y) {}

    void printErrorData() const {
        cout << "[Детали исключения] Недопустимая дата:" << endl;
        cout << "  День:  " << err_day   << " (допустимо: 1-31)" << endl;
        cout << "  Месяц: " << err_month << " (допустимо: 1-12)" << endl;
        cout << "  Год:   " << err_year  << " (допустимо: 1900-2100)" << endl;
    }
};

class Date {
private:
    int day;
    int month;
    int year;

public:
    Date(int d, int m, int y) {
        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
            throw DateException(
                "Одно или несколько полей даты выходят за допустимый диапазон!",
                d, m, y
            );
        }
        day = d;
        month = m;
        year = y;
    }

    void print() const {
        cout << "Дата: " << day << "." << month << "." << year << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        Date validDate(15, 6, 2024);
        cout << "Объект успешно создан!" << endl;
        validDate.print();
    }
    catch (const DateException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        Date invalidDate(32, 13, 1800);

        cout << "Этот текст не напечатается, объект не создан." << endl;
        invalidDate.print();
    }
    catch (const DateException& e) {
        cerr << "\nПерехвачено ожидаемое исключение:" << endl;
        cerr << "Сообщение (базовый класс out_of_range): " << e.what() << endl;
        e.printErrorData();
    }
    catch (const out_of_range& e) {
        cerr << "out_of_range перехвачен: " << e.what() << endl;
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
class DateException : public out_of_range {{
private:
    int err_day, err_month, err_year;
```
Наследуем от `out_of_range`. Три поля хранят "забракованные" значения — день, месяц и год. Это позволяет в блоке `catch` точно узнать, чем именно вызвана ошибка.

```cpp
    DateException(const string& message, int d, int m, int y)
        : out_of_range(message), err_day(d), err_month(m), err_year(y) {{}}
```
Конструктор вызывает родительский `out_of_range(message)` и сохраняет плохие значения. Метод `e.what()` вернёт текстовое сообщение.

## 2. Интеграция в класс Date и блок `throw`
```cpp
    Date(int d, int m, int y) {{
        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {{
            throw DateException("Сообщение!", d, m, y);
        }}
        day = d; month = m; year = y;
    }}
```
В конструкторе `Date` валидация: день 1–31, месяц 1–12, год 1900–2100. При нарушении — **`throw`**: объект не создаётся, программа откатывается к `catch`.

## 3. Блоки `try - catch`
```cpp
    try {{
        Date invalidDate(32, 13, 1800);
        cout << "Этот текст не напечатается";
    }}
```
В `try` происходит попытка создания. При `throw` код "выпрыгивает" и ищет `catch`.

```cpp
    catch (const DateException& e) {{
        cerr << e.what() << endl;
        e.printErrorData();
    }}
```
Первым ловим `DateException` — самый специфичный тип. `e.printErrorData()` выведет значения `(32, 13, 1800)`.

```cpp
    catch (const out_of_range& e) {{ ... }}
    catch (const exception& e) {{ ... }}
```
Резервные блоки от специфичного к общему. Полиморфизм гарантирует правильный порядок обработки.
