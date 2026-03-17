# Разбор кода: Лабораторная работа 7 (Вариант 21)

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

using namespace std;

mutex cout_mtx;

void safePrint(const string& threadName, const string& item) {
    lock_guard<mutex> lock(cout_mtx);
    cout << "[" << threadName << "] Печать: " << item << endl;
}

void printFibonacci(int n) {
    long long a = 0, b = 1;
    for (int i = 0; i < n; ++i) {
        safePrint("Thread 1 (Fibonacci)", to_string(a));
        long long next = a + b;
        a = b;
        b = next;
        this_thread::sleep_for(chrono::milliseconds(20)); 
    }
}

void printNaturalNumbers(int n) {
    for (int i = 1; i <= n; ++i) {
        safePrint("Thread 2 (Natural)", to_string(i));
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
    
    int num_elements = 5; 

    cout << "1. Демонстрация работы с классами thread\n";

    thread t1(printFibonacci, num_elements);
    thread t2(printNaturalNumbers, num_elements);
    thread t3(printRandomNumbers, num_elements);

    t1.join();
    t2.join();
    t3.join();
    
    cout << "\nВсе потоки (thread) завершили работу.\n\n";

    cout << "\n2. Демонстрация работы через async и future\n";

    future<void> f1 = async(launch::async, printFibonacci, num_elements);
    future<void> f2 = async(launch::async, printNaturalNumbers, num_elements);
    future<void> f3 = async(launch::async, printRandomNumbers, num_elements);

    f1.wait();
    f2.wait();
    f3.wait();

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


## Функции потоков (Задание 1)

### Поток 1: Числа Фибоначчи
```cpp
void printFibonacci(int n) {{
    long long a = 0, b = 1;
    for (int i = 0; i < n; ++i) {{
        safePrint("Thread 1 (Fibonacci)", to_string(a));
        long long next = a + b; a = b; b = next;
        this_thread::sleep_for(chrono::milliseconds(20));
    }}
}}
```
Генерирует последовательность Фибоначчи: 0, 1, 1, 2, 3, 5, 8... Каждый следующий элемент = сумма двух предыдущих. Используем `long long`, чтобы числа не переполнились.

### Поток 2: Натуральные числа
```cpp
void printNaturalNumbers(int n) {{
    for (int i = 1; i <= n; ++i) {{
        safePrint("Thread 2 (Natural)", to_string(i));
    }}
}}
```
Простой цикл от 1 до n.

### Поток 3: Случайные числа
```cpp
void printRandomNumbers(int n) {{
    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(1, 100);
    for (int i = 0; i < n; ++i) {{
        safePrint("Thread 3 (Random)", to_string(dis(gen)));
    }}
}}
```
Используем генератор Мерсенна (`mt19937`) — высококачественный ГПСЧ. `random_device` дает начальное зерно (seed) от аппаратного генератора. `uniform_int_distribution` задает диапазон [1, 100].


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

