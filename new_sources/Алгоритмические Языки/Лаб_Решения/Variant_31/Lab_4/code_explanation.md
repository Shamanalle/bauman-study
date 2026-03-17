# Разбор кода: Лабораторная работа 4 (Вариант 31)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением реализации класса `BankDeposit` и использования алгоритмов STL.

## Полный исходный код программы
```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <list>
#include <vector>

using namespace std;

class BankDeposit {
private:
    string name;
    double amount;
    string currency;
    double rate;

public:
    BankDeposit() : name(""), amount(0.0), currency("RUB"), rate(0.0) {}

    BankDeposit(string n, double a, string c, double r)
        : name(move(n)), amount(a), currency(move(c)), rate(r) {}

    BankDeposit(const BankDeposit& other)
        : name(other.name), amount(other.amount), currency(other.currency), rate(other.rate) {}

    BankDeposit(BankDeposit&& other) noexcept
        : name(move(other.name)), amount(other.amount),
          currency(move(other.currency)), rate(other.rate) {}

    BankDeposit& operator=(const BankDeposit& other) {
        if (this != &other) {
            name = other.name;
            amount = other.amount;
            currency = other.currency;
            rate = other.rate;
        }
        return *this;
    }

    BankDeposit& operator=(BankDeposit&& other) noexcept {
        if (this != &other) {
            name = move(other.name);
            amount = other.amount;
            currency = move(other.currency);
            rate = other.rate;
        }
        return *this;
    }

    string getName() const { return name; }
    double getAmount() const { return amount; }

    friend ostream& operator<<(ostream& os, const BankDeposit& d) {
        os << "Вклад: '" << d.name << "', Сумма: " << d.amount
           << " " << d.currency << ", Ставка: " << d.rate << "%";
        return os;
    }

    friend istream& operator>>(istream& is, BankDeposit& d) {
        is >> d.name >> d.amount >> d.currency >> d.rate;
        return is;
    }
};

bool compareByName(const BankDeposit& a, const BankDeposit& b) {
    return a.getName() < b.getName();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    list<BankDeposit> items;
    BankDeposit temp;

    while (fin >> temp) {
        items.push_back(temp);
    }
    fin.close();

    ofstream fout("output.txt");

    fout << "Исходный контейнер (list):\n";
    cout << "Исходный контейнер (list):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    items.sort(compareByName);

    fout << "\nОтсортированный контейнер (по названию):\n";
    cout << "\nОтсортированный контейнер (по названию):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    vector<BankDeposit> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());

    fout << "\nСкопированный контейнер (vector):\n";
    cout << "\nСкопированный контейнер (vector):\n";
    for (const auto& item : copied) {
        fout << item << "\n";
        cout << item << "\n";
    }

    fout.close();
    cout << "\nУспех! Результаты сохранены в файл output.txt" << endl;

    return 0;
}

```

---

## 1. Класс `BankDeposit`

### Поля класса
```cpp
private:
    string name;
    double amount;
    string currency;
    double rate;
```
Поля класса объявлены как `private` — это стандартная инкапсуляция. Доступ к ним осуществляется через геттеры для чтения и оператор `>>` для записи.

### Конструкторы
```cpp
    BankDeposit() : name(""), amount(0.0), currency("RUB"), rate(0.0) {}
```
**Конструктор по умолчанию** необходим для работы с STL-контейнерами. Когда мы пишем `vector<BankDeposit> copied(items.size())`, контейнер создает `items.size()` объектов, вызывая для каждого конструктор по умолчанию.

```cpp
    BankDeposit(string n, double a, string c, double r)
        : name(move(n)), amount(a), currency(move(c)), rate(r) {}
```
**Конструктор с параметрами** инициализирует поля. Заметим `move()` для строковых полей. Поскольку строки (`string`) — это ресурсоемкие объекты, которые выделяют память динамически внутри себя, вместо того чтобы целиком копировать строку, мы **перемещаем** байты прямо в поле с помощью `move()`, что намного быстрее.

### Конструктор копирования и перемещения
```cpp
    BankDeposit(const BankDeposit& other)
        : name(other.name), amount(other.amount), currency(other.currency), rate(other.rate) {}
```
**Конструктор копирования** создаёт полную копию объекта. Все поля копируются из `other`.

```cpp
    BankDeposit(BankDeposit&& other) noexcept
        : name(move(other.name)), amount(other.amount),
          currency(move(other.currency)), rate(other.rate) {}
```
**Конструктор перемещения** оптимизирует передачу объектов в памяти (например, при вызове `push_back` и расширении массива под капотом вектора). `noexcept` указывает, что этот метод никогда не выбросит исключение — тогда STL-контейнеры будут использовать его вместо медленного конструктора копирования.

### Операторы присваивания
```cpp
    BankDeposit& operator=(const BankDeposit& other) {
        if (this != &other) {
            name = other.name;
            amount = other.amount;
            currency = other.currency;
            rate = other.rate;
        }
        return *this;
    }
```
**Оператор копирующего присваивания**. Проверка `if (this != &other)` предотвращает саморазрушение при `a = a`.

```cpp
    BankDeposit& operator=(BankDeposit&& other) noexcept { ... }
```
**Оператор перемещающего присваивания**. Аналогичен конструктору перемещения, но для уже существующих объектов. Используется алгоритмом `std::copy` при перезаписи элементов целевого контейнера.

### Операторы потокового ввода/вывода
```cpp
    friend istream& operator>>(istream& is, BankDeposit& d) {
        is >> d.name >> d.amount >> d.currency >> d.rate;
        return is;
    }
```
Мы переопределяем оператор `>>`. Теперь мы можем просто писать `fin >> temp` и программа сама считает все поля из текстового файла, разбив их по пробелу. Оператор объявлен как **`friend`**, чтобы иметь доступ к `private` полям класса.

---

## 2. Логика функции `main`

### Чтение из файла
```cpp
    list<BankDeposit> items;
    BankDeposit temp;
    while (fin >> temp) {
        items.push_back(temp);
    }
```
Мы создаем контейнер `list`. В цикле `while` считываем по одному объекту из файла до тех пор, пока не достигнем его конца. Метод `push_back` вставляет элемент в конец контейнера, при необходимости самостоятельно увеличивая размер.

### Сортировка (Метод `list::sort`)
```cpp
items.sort(compareByName);
```
Контейнер `list` предоставляет только двунаправленные итераторы (Bidirectional Iterator), а для алгоритма `std::sort` нужны итераторы произвольного доступа (Random Access Iterator). Поэтому у `list` есть **собственный метод** `sort()`, который принимает функцию-компаратор. Компаратор объясняет, какой элемент считать «меньшим» — сортировка по названию.

### Копирование (Алгоритм `std::copy`)
```cpp
    vector<BankDeposit> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());
```
По заданию мы копируем данные из `list` в `vector`.
1. Мы обязаны **выделить память** в целевом контейнере `copied` через конструктор `(items.size())`, потому что `std::copy` только перезаписывает уже выделенные ячейки (не выделяет новую память).
2. `std::copy` берёт элементы от `begin()` до `end()` исходного контейнера и последовательно присваивает (использует `operator=`) в целевой.
