# Разбор кода: Лабораторная работа 4 (Вариант 34)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением реализации класса `Employee` и использования алгоритмов STL.

## Полный исходный код программы
```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <list>
#include <vector>

using namespace std;

class Employee {
private:
    string name;
    string hireDate;
    string position;
    double salary;

public:
    Employee() : name(""), hireDate(""), position(""), salary(0.0) {}

    Employee(string n, string d, string p, double s)
        : name(move(n)), hireDate(move(d)), position(move(p)), salary(s) {}

    Employee(const Employee& other)
        : name(other.name), hireDate(other.hireDate), position(other.position), salary(other.salary) {}

    Employee(Employee&& other) noexcept
        : name(move(other.name)), hireDate(move(other.hireDate)),
          position(move(other.position)), salary(other.salary) {}

    Employee& operator=(const Employee& other) {
        if (this != &other) {
            name = other.name;
            hireDate = other.hireDate;
            position = other.position;
            salary = other.salary;
        }
        return *this;
    }

    Employee& operator=(Employee&& other) noexcept {
        if (this != &other) {
            name = move(other.name);
            hireDate = move(other.hireDate);
            position = move(other.position);
            salary = other.salary;
        }
        return *this;
    }

    string getName() const { return name; }
    double getSalary() const { return salary; }

    friend ostream& operator<<(ostream& os, const Employee& e) {
        os << "Сотрудник: " << e.name << ", Дата приёма: " << e.hireDate
           << ", Должность: " << e.position << ", Оклад: " << e.salary << " руб.";
        return os;
    }

    friend istream& operator>>(istream& is, Employee& e) {
        is >> e.name >> e.hireDate >> e.position >> e.salary;
        return is;
    }
};

bool compareByName(const Employee& a, const Employee& b) {
    return a.getName() < b.getName();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    list<Employee> items;
    Employee temp;

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

    fout << "\nОтсортированный контейнер (по ФИО):\n";
    cout << "\nОтсортированный контейнер (по ФИО):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    vector<Employee> copied(items.size());
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

## 1. Класс `Employee`

### Поля класса
```cpp
private:
    string name;
    string hireDate;
    string position;
    double salary;
```
Поля класса объявлены как `private` — это стандартная инкапсуляция. Доступ к ним осуществляется через геттеры для чтения и оператор `>>` для записи.

### Конструкторы
```cpp
    Employee() : name(""), hireDate(""), position(""), salary(0.0) {}
```
**Конструктор по умолчанию** необходим для работы с STL-контейнерами. Когда мы пишем `vector<Employee> copied(items.size())`, контейнер создает `items.size()` объектов, вызывая для каждого конструктор по умолчанию.

```cpp
    Employee(string n, string d, string p, double s)
        : name(move(n)), hireDate(move(d)), position(move(p)), salary(s) {}
```
**Конструктор с параметрами** инициализирует поля. Заметим `move()` для строковых полей. Поскольку строки (`string`) — это ресурсоемкие объекты, которые выделяют память динамически внутри себя, вместо того чтобы целиком копировать строку, мы **перемещаем** байты прямо в поле с помощью `move()`, что намного быстрее.

### Конструктор копирования и перемещения
```cpp
    Employee(const Employee& other)
        : name(other.name), hireDate(other.hireDate), position(other.position), salary(other.salary) {}
```
**Конструктор копирования** создаёт полную копию объекта. Все поля копируются из `other`.

```cpp
    Employee(Employee&& other) noexcept
        : name(move(other.name)), hireDate(move(other.hireDate)),
          position(move(other.position)), salary(other.salary) {}
```
**Конструктор перемещения** оптимизирует передачу объектов в памяти (например, при вызове `push_back` и расширении массива под капотом вектора). `noexcept` указывает, что этот метод никогда не выбросит исключение — тогда STL-контейнеры будут использовать его вместо медленного конструктора копирования.

### Операторы присваивания
```cpp
    Employee& operator=(const Employee& other) {
        if (this != &other) {
            name = other.name;
            hireDate = other.hireDate;
            position = other.position;
            salary = other.salary;
        }
        return *this;
    }
```
**Оператор копирующего присваивания**. Проверка `if (this != &other)` предотвращает саморазрушение при `a = a`.

```cpp
    Employee& operator=(Employee&& other) noexcept { ... }
```
**Оператор перемещающего присваивания**. Аналогичен конструктору перемещения, но для уже существующих объектов. Используется алгоритмом `std::copy` при перезаписи элементов целевого контейнера.

### Операторы потокового ввода/вывода
```cpp
    friend istream& operator>>(istream& is, Employee& e) {
        is >> e.name >> e.hireDate >> e.position >> e.salary;
        return is;
    }
```
Мы переопределяем оператор `>>`. Теперь мы можем просто писать `fin >> temp` и программа сама считает все поля из текстового файла, разбив их по пробелу. Оператор объявлен как **`friend`**, чтобы иметь доступ к `private` полям класса.

---

## 2. Логика функции `main`

### Чтение из файла
```cpp
    list<Employee> items;
    Employee temp;
    while (fin >> temp) {
        items.push_back(temp);
    }
```
Мы создаем контейнер `list`. В цикле `while` считываем по одному объекту из файла до тех пор, пока не достигнем его конца. Метод `push_back` вставляет элемент в конец контейнера, при необходимости самостоятельно увеличивая размер.

### Сортировка (Метод `list::sort`)
```cpp
items.sort(compareByName);
```
Контейнер `list` предоставляет только двунаправленные итераторы (Bidirectional Iterator), а для алгоритма `std::sort` нужны итераторы произвольного доступа (Random Access Iterator). Поэтому у `list` есть **собственный метод** `sort()`, который принимает функцию-компаратор. Компаратор объясняет, какой элемент считать «меньшим» — сортировка по ФИО.

### Копирование (Алгоритм `std::copy`)
```cpp
    vector<Employee> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());
```
По заданию мы копируем данные из `list` в `vector`.
1. Мы обязаны **выделить память** в целевом контейнере `copied` через конструктор `(items.size())`, потому что `std::copy` только перезаписывает уже выделенные ячейки (не выделяет новую память).
2. `std::copy` берёт элементы от `begin()` до `end()` исходного контейнера и последовательно присваивает (использует `operator=`) в целевой.
