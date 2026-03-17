# Разбор кода: Лабораторная работа 7 (Вариант 32)

Ниже представлен полный исходный код из `main.cpp`.
В последующих разделах этот код разбит на логические блоки с объяснением механизмов создания потоков и их синхронизации.

## Полный исходный код программы
```cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <future>
#include <string>
#include <random>
#include <chrono>
#include <vector>
#include <sstream>
#include <iomanip>

using namespace std;

mutex cout_mtx;

void safePrint(const string& threadName, const string& item) {
    lock_guard<mutex> lock(cout_mtx);
    cout << "[" << threadName << "] " << item << endl;
}

void multiplyArrays(const vector<double>& a, const vector<double>& b, int n) {
    for (int i = 0; i < n; ++i) {
        ostringstream oss;
        oss << fixed << setprecision(2) << a[i] << " * " << b[i] << " = " << (a[i] * b[i]);
        safePrint("Thread 1 (Multiply)", oss.str());
        this_thread::sleep_for(chrono::milliseconds(20));
    }
}

void addArrays(const vector<double>& a, const vector<double>& b, int n) {
    for (int i = 0; i < n; ++i) {
        ostringstream oss;
        oss << fixed << setprecision(2) << a[i] << " + " << b[i] << " = " << (a[i] + b[i]);
        safePrint("Thread 2 (Add)", oss.str());
        this_thread::sleep_for(chrono::milliseconds(15));
    }
}

void printRandomNumbers(int n) {
    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(1, 100);
    for (int i = 0; i < n; ++i) {
        safePrint("Thread 3 (Random)", to_string(dis(gen)));
        this_thread::sleep_for(chrono::milliseconds(25));
    }
}

int main() {
    setlocale(LC_ALL, "Russian");

    const int N = 5;
    random_device rd;
    mt19937 gen(rd());
    uniform_real_distribution<> dis(1.0, 50.0);

    vector<double> arr1(N), arr2(N);
    for (int i = 0; i < N; i++) { arr1[i] = dis(gen); arr2[i] = dis(gen); }

    cout << "1. Демонстрация работы с классами thread\n";

    thread t1(multiplyArrays, cref(arr1), cref(arr2), N);
    thread t2(addArrays, cref(arr1), cref(arr2), N);
    thread t3(printRandomNumbers, N);

    t1.join(); t2.join(); t3.join();
    cout << "\nВсе потоки (thread) завершили работу.\n\n";

    cout << "\n2. Демонстрация работы через async и future\n";

    auto f1 = async(launch::async, multiplyArrays, cref(arr1), cref(arr2), N);
    auto f2 = async(launch::async, addArrays, cref(arr1), cref(arr2), N);
    auto f3 = async(launch::async, printRandomNumbers, N);

    f1.wait(); f2.wait(); f3.wait();
    cout << "\nВсе асинхронные задачи (async) завершили работу." << endl;

    return 0;
}

```

---

## 1. Синхронизация вывода (Мьютексы)
В C++ `cout` не является потокобезопасным (Thread-safe). Если 3 потока одновременно попытаются отправить туда буквы, текст может смешаться.

```cpp
mutex cout_mtx;

void safePrint(...) {{
    lock_guard<mutex> lock(cout_mtx);
    cout << ... ;
}}
```
Глобальный "замок" (`mutex`). Внутри `safePrint` создаётся `std::lock_guard` — RAII-обертка. Когда создаётся объект `lock`, он "запирает" мьютекс. Первый поток захватывает консоль и печатает. Остальные **ждут**. Когда функция завершается, объект уничтожается, замок снимается.

## 2. Имитация работы
```cpp
this_thread::sleep_for(chrono::milliseconds(20));
```
Чтобы увидеть "соревнование" потоков, заставляем их засыпать на 15-25 мс после каждой строчки.


## Функции потоков (Задание 2)

### Подготовка данных
```cpp
    vector<double> arr1(N), arr2(N);
    for (int i = 0; i < N; i++) {{ arr1[i] = dis(gen); arr2[i] = dis(gen); }}
```
Два массива заполняются случайными вещественными числами **до** запуска потоков. Потоки получают эти массивы через `std::cref` (константная ссылка).

### Поток 1: Умножение
```cpp
void multiplyArrays(const vector<double>& a, const vector<double>& b, int n) {{
    for (int i = 0; i < n; ++i) {{
        ostringstream oss;
        oss << a[i] << " * " << b[i] << " = " << (a[i] * b[i]);
        safePrint("Thread 1 (Multiply)", oss.str());
    }}
}}
```
Умножает i-й элемент первого массива на i-й элемент второго. Используем `ostringstream` для форматирования строки перед печатью.

### Поток 2: Сложение
Аналогично, но выполняет операцию сложения.

### Поток 3: Случайные числа
Генерирует случайные числа через `mt19937`.

### Передача массивов в поток
```cpp
    thread t1(multiplyArrays, cref(arr1), cref(arr2), N);
```
`std::cref` — обертка для передачи константной ссылки в поток. Без неё `thread` скопировал бы массивы (а нам нужен один экземпляр данных).


## 3. Низкоуровневые потоки (`thread`)
```cpp
    thread t1(func, args...);
```
Создаём системный поток и передаём "указатель на функцию" и аргументы. Поток начинает работать немедленно.

```cpp
    t1.join();
```
Функция `join()` обязательна! Это команда главному потоку: "Стой и жди завершения". Без `join()` программа аварийно упадёт.

## 4. Высокоуровневые задачи (`async`)
```cpp
    future<void> f1 = async(launch::async, func, args...);
```
`launch::async` заставляет запустить задачу строго в новом потоке. Получаем `future` — "обещание результата".

```cpp
    f1.wait();
```
Вместо `join`, используем `wait()` — "Подожди, пока задача завершится".

