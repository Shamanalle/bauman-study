# Разбор кода: Лабораторная работа 6 (Вариант 1)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным объяснением механизма генерации и перехвата исключений (exceptions).

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>
#include <stdexcept>

using namespace std;

class TimeException : public out_of_range {
private:
    int err_hours;
    int err_minutes;
    int err_seconds;

public:
    TimeException(const string& message, int h, int m, int s)
        : out_of_range(message), err_hours(h), err_minutes(m), err_seconds(s) {}

    void printErrorData() const {
        cout << "[Детали исключения] Недопустимое время:" << endl;
        cout << "  Часы:    " << err_hours   << " (допустимо: 0-23)" << endl;
        cout << "  Минуты:  " << err_minutes << " (допустимо: 0-59)" << endl;
        cout << "  Секунды: " << err_seconds << " (допустимо: 0-59)" << endl;
    }
};

class Time {
private:
    int hours;
    int minutes;
    int seconds;

public:
    Time(int h, int m, int s) {
        if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) {
            throw TimeException(
                "Одно или несколько полей времени выходят за допустимый диапазон!",
                h, m, s
            );
        }
        hours = h;
        minutes = m;
        seconds = s;
    }

    void print() const {
        cout << "Время: " << hours << ":" << minutes << ":" << seconds << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        Time validTime(14, 30, 45);
        cout << "Объект успешно создан!" << endl;
        validTime.print();
    }
    catch (const TimeException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        Time invalidTime(25, -1, 61);

        cout << "Этот текст не напечатается, объект не создан." << endl;
        invalidTime.print();
    }
    catch (const TimeException& e) {
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
По заданию мы наследуем класс `TimeException` от базового `out_of_range` (выход значения за допустимые пределы).

```cpp
class TimeException : public out_of_range {{
private:
    int err_hours;
    int err_minutes;
    int err_seconds;
```
Внутри объекта исключения мы добавляем три приватных поля — часы, минуты и секунды. Это наша "аналитика". Если программа "сломалась", мы сможем посмотреть, какие именно значения вызвали поломку. Базовые ошибки C++ (например, `throw out_of_range()`) могут вернуть только текст.

```cpp
    TimeException(const string& message, int h, int m, int s)
        : out_of_range(message), err_hours(h), err_minutes(m), err_seconds(s) {{}}
```
Конструктор ошибки сначала вызывает родительский конструктор `: out_of_range(message)`, куда мы передаем текстовое сообщение. Оно будет доступно по команде `e.what()`.

```cpp
    void printErrorData() const {{
        cout << "[Детали исключения] Недопустимое время:" << endl;
        cout << "  Часы:    " << err_hours   << " (допустимо: 0-23)" << endl;
        ...
    }}
```
Метод `printErrorData()` выводит "забракованные" значения — это требование задания.

## 2. Интеграция в класс Time и блок `throw`
```cpp
class Time {{
    ...
    Time(int h, int m, int s) {{
        if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) {{
            throw TimeException("Сообщение!", h, m, s);
        }}
        hours = h; minutes = m; seconds = s;
    }}
```
В конструкторе `Time` происходит **валидация**: часы должны быть 0–23, минуты 0–59, секунды 0–59.
Если параметры плохие, происходит **`throw`** (бросок). Выполнение функции моментально останавливается. Объект `Time` не досоздается до конца и считается несозданным.
Вместо этого программа откатывается назад в поиске того, кто "поймает" эту ошибку (раскрутка стека вызовов).

## 3. Блоки `try - catch`
```cpp
    try {{
        Time invalidTime(25, -1, 61);
        cout << "Этот текст не напечатается";
        invalidTime.print();
    }}
```
**`try`** — место, где мы говорим компилятору: "Внимательно наблюдай за этим куском кода!". На строке `invalidTime` происходит `throw`. Код "выпрыгивает" из блока `try` (поэтому `cout` не печатается) и начинает передавать управление вниз.

```cpp
    catch (const TimeException& e) {{
        cerr << e.what() << endl;
        e.printErrorData();
    }}
```
**`catch`** ("Поймать"). Как только брошенный объект совпадает по типу с тем, который ждет `catch`, код входит внутрь блока.
- `e.what()` выведет текстовое сообщение.
- `e.printErrorData()` отработает наш метод и сообщит значения `(25, -1, 61)`.

```cpp
    catch (const exception& e) {{ ... }}
```
Резервный блок `catch` (родительский) для любых других системных ошибок. Полиморфизм гарантирует, что обработчик `TimeException` сработает первым.
