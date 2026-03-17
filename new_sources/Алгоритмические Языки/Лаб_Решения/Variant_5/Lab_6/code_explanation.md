# Разбор кода: Лабораторная работа 6 (Вариант 5)

Ниже представлен полный исходный код из `main.cpp`.

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>
#include <stdexcept>
#include <vector>

using namespace std;

class FibException : public invalid_argument {
private:
    vector<int> err_arr;
    int err_size;

public:
    FibException(const string& message, const int* arr, int sz)
        : invalid_argument(message), err_arr(arr, arr + sz), err_size(sz) {}

    void printErrorData() const {
        cout << "[Детали исключения] Массив не является последовательностью Фибоначчи:" << endl;
        cout << "  Размер: " << err_size << endl;
        cout << "  Элементы: ";
        for (int x : err_arr) cout << x << " ";
        cout << endl;
    }
};

class FibArray {
private:
    int* data;
    int size;

    bool isFib(const int* arr, int n) const {
        if (n < 2) return true;
        if (arr[0] != 0 || arr[1] != 1) return false;
        for (int i = 2; i < n; i++) {
            if (arr[i] != arr[i-1] + arr[i-2]) return false;
        }
        return true;
    }

public:
    FibArray(const int* arr, int n) {
        if (!isFib(arr, n)) {
            throw FibException(
                "Переданный массив не является последовательностью Фибоначчи!",
                arr, n
            );
        }
        size = n;
        data = new int[size];
        for (int i = 0; i < size; i++) data[i] = arr[i];
    }

    ~FibArray() { delete[] data; }

    void print() const {
        cout << "Массив Фибоначчи (" << size << " элементов): ";
        for (int i = 0; i < size; i++) cout << data[i] << " ";
        cout << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        int goodArr[] = {0, 1, 1, 2, 3, 5, 8};
        FibArray fib(goodArr, 7);
        cout << "Объект успешно создан!" << endl;
        fib.print();
    }
    catch (const FibException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        int badArr[] = {0, 1, 1, 2, 4, 7};
        FibArray fib2(badArr, 6);

        cout << "Этот текст не напечатается, объект не создан." << endl;
        fib2.print();
    }
    catch (const FibException& e) {
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
class FibException : public invalid_argument {{
private:
    vector<int> err_arr;
    int err_size;
```
Наследуем от `invalid_argument`. Хранит копию "забракованного" массива в `vector<int>` и его размер. Обратите внимание: мы используем `vector`, а не сырой указатель, чтобы исключение могло безопасно хранить копию данных.

```cpp
    FibException(const string& message, const int* arr, int sz)
        : invalid_argument(message), err_arr(arr, arr + sz), err_size(sz) {{}}
```
Конструктор вызывает `invalid_argument(message)` и копирует массив через конструктор `vector(begin, end)`.

## 2. Класс FibArray и блок `throw`
```cpp
    bool isFib(const int* arr, int n) const {{
        if (n < 2) return true;
        if (arr[0] != 0 || arr[1] != 1) return false;
        for (int i = 2; i < n; i++) {{
            if (arr[i] != arr[i-1] + arr[i-2]) return false;
        }}
        return true;
    }}
```
Проверка: первые два элемента — 0 и 1, каждый следующий = сумма двух предыдущих. Если хотя бы одно условие нарушено — массив не Фибоначчи.

```cpp
    FibArray(const int* arr, int n) {{
        if (!isFib(arr, n)) {{
            throw FibException("Не Фибоначчи!", arr, n);
        }}
        size = n;
        data = new int[size];
        for (int i = 0; i < size; i++) data[i] = arr[i];
    }}
```
Конструктор валидирует: если массив не Фибоначчи → `throw`. Важно: `new int[]` вызывается **только** после проверки, поэтому утечки памяти не будет.

## 3. Блоки `try - catch`
```cpp
    try {{
        int badArr[] = {{0, 1, 1, 2, 4, 7}};  // 4 != 1+2=3
        FibArray fib2(badArr, 6);
    }}
    catch (const FibException& e) {{
        cerr << e.what() << endl;
        e.printErrorData();  // выведет [0, 1, 1, 2, 4, 7]
    }}
```
Ловим `FibException` первым, затем `invalid_argument`, затем `exception`.
