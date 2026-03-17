# Разбор кода: Лабораторная работа 7 (Вариант 18)

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

using namespace std;

mutex cout_mtx;

void safePrint(const string& threadName, const string& item) {
    lock_guard<mutex> lock(cout_mtx);
    cout << "[" << threadName << "] " << item << endl;
}

void selectionSort(vector<double>& arr, int left, int right, const string& name) {
    for (int i = left; i < right - 1; ++i) {
        int minIdx = i;
        for (int j = i + 1; j < right; ++j) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx != i) swap(arr[i], arr[minIdx]);
    }
    // Печать отсортированной части
    for (int i = left; i < right; ++i) {
        safePrint(name, to_string(arr[i]));
        this_thread::sleep_for(chrono::milliseconds(15));
    }
}

int main() {
    setlocale(LC_ALL, "Russian");

    const int N = 10;
    vector<double> arr(N);
    random_device rd;
    mt19937 gen(rd());
    uniform_real_distribution<> dis(1.0, 100.0);
    for (int i = 0; i < N; i++) arr[i] = dis(gen);

    cout << "Исходный массив: ";
    for (double x : arr) cout << x << " ";
    cout << endl;

    int mid = N / 2;

    cout << "\n1. Демонстрация thread\n";
    vector<double> arr_copy = arr;

    thread t1(selectionSort, ref(arr_copy), 0, mid, "Thread 1 (Left half)");
    thread t2(selectionSort, ref(arr_copy), mid, N, "Thread 2 (Right half)");
    t1.join();
    t2.join();

    thread t3(selectionSort, ref(arr_copy), 0, N, "Thread 3 (Full)");
    t3.join();

    cout << "\nВсе потоки (thread) завершили работу.\n\n";

    cout << "2. Демонстрация async\n";
    vector<double> arr_copy2 = arr;

    auto f1 = async(launch::async, selectionSort, ref(arr_copy2), 0, mid, "Thread 1 (Left half)");
    auto f2 = async(launch::async, selectionSort, ref(arr_copy2), mid, N, "Thread 2 (Right half)");
    f1.wait();
    f2.wait();

    auto f3 = async(launch::async, selectionSort, ref(arr_copy2), 0, N, "Thread 3 (Full)");
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


## Функции потоков (Задание 3)

### Сортировка прямым выбором (Selection Sort)
```cpp
void selectionSort(vector<double>& arr, int left, int right, const string& name) {{
    for (int i = left; i < right - 1; ++i) {{
        int minIdx = i;
        for (int j = i + 1; j < right; ++j) {{
            if (arr[j] < arr[minIdx]) minIdx = j;
        }}
        if (minIdx != i) swap(arr[i], arr[minIdx]);
    }}
}}
```
Алгоритм Selection Sort: на каждом шаге ищем минимальный элемент в неотсортированной части и ставим его на правильное место. Сложность: O(n²). Одна функция используется для всех трёх потоков с разными диапазонами `[left, right)`.

### Логика потоков
1. **Потоки 1 и 2** запускаются параллельно и сортируют каждый свою половину массива.
2. После `join()`/`wait()` первых двух потоков запускается **Поток 3**, который сортирует массив целиком (уже частично отсортированный).

```cpp
    thread t1(selectionSort, ref(arr_copy), 0, mid, "Thread 1");
    thread t2(selectionSort, ref(arr_copy), mid, N, "Thread 2");
    t1.join(); t2.join();
    thread t3(selectionSort, ref(arr_copy), 0, N, "Thread 3");
    t3.join();
```
`std::ref` передает массив по ссылке (без копирования), чтобы потоки модифицировали один и тот же массив.


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

