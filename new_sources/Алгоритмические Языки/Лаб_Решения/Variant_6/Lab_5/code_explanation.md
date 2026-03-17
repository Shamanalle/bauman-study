# Разбор кода: Лабораторная работа 5 (Вариант 6)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением механизмов использования ассоциативных контейнеров.

## Полный исходный код программы
```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <set>
#include <unordered_set>

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

    const string& getName() const { return name; }
    const string& getHireDate() const { return hireDate; }
    const string& getPosition() const { return position; }
    double getSalary() const { return salary; }

    bool operator<(const Employee& other) const {
        if (name != other.name) return name < other.name;
        return salary < other.salary;
    }

    bool operator==(const Employee& other) const {
        return (name == other.name &&
                hireDate == other.hireDate &&
                position == other.position &&
                salary == other.salary);
    }

    friend ostream& operator<<(ostream& os, const Employee& e) {
        os << "Сотрудник: " << e.name << ", Дата: " << e.hireDate
           << ", Должность: " << e.position << ", Оклад: " << e.salary << " руб.";
        return os;
    }

    friend istream& operator>>(istream& is, Employee& e) {
        is >> e.name >> e.hireDate >> e.position >> e.salary;
        return is;
    }
};

namespace std {
    template<>
    struct hash<Employee> {
        size_t operator()(const Employee& obj) const {
            size_t h1 = hash<string>()(obj.getName());
            size_t h2 = hash<double>()(obj.getSalary());
            return h1 ^ (h2 << 1);
        }
    };
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    set<Employee> orderedSet;
    unordered_set<Employee> hashSet;
    
    Employee tempObj;

    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
    fin.close();

    cout << "Дерево set (Сортировка по ФИО):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }

    cout << "\nХэш-таблица unordered_set (Без порядка):\n";
    for (const auto& item : hashSet) {
        cout << item << endl;
    }

    return 0;
}

```

---

## 1. Как работает `set`

```cpp
    bool operator<(const Employee& other) const {
        if (name != other.name) return name < other.name;
        return salary < other.salary;
    }
```
Контейнер `set` постоянно сортирует элементы "на лету", расставляя их по веткам бинарного дерева поиска (Red-Black Tree). Для этого ему нужна **только** одна операция: проверка на `<` (меньше).

Особенность работы дерева: оно считает два объекта **абсолютно одинаковыми** (и удаляет дубликат), если `A не меньше B, и B не меньше A`. 
Если бы мы проверяли **только** поле `name`:
- Два объекта с одинаковым значением `name` считались бы эквивалентными.
- `!(name_a < name_b)` и `!(name_b < name_a)` — оба ложные, значит дерево решит, что это **одна и та же** запись и выбросит вторую.

Мы избегаем этого, добавляя дополнительный критерий `salary` в случае равных значений основного поля (составное/каскадное условие сортировки).

---

## 2. Как работает `unordered_set`

### Оператор равенства `==`
```cpp
    bool operator==(const Employee& other) const {
        return (name == other.name &&
                hireDate == other.hireDate &&
                position == other.position &&
                salary == other.salary);
    }
```
Хэш-контейнеры не используют сортировку. Они кладут объект в "ящик" (bucket). Чтобы проверить два объекта на совпадение в этом "ящике" (при коллизии хэшей), им нужен явный **оператор равенства** `==`. Мы сравниваем **все** поля объекта на точное совпадение.

### Специализация `std::hash`
```cpp
namespace std {
    template<>
    struct hash<Employee> {
        size_t operator()(const Employee& obj) const {
            size_t h1 = hash<string>()(obj.getName());
            size_t h2 = hash<double>()(obj.getSalary());
            return h1 ^ (h2 << 1);
        }
    };
}
```
Чтобы определить, **в какой именно ящик** (bucket) положить объект, нужна хэш-функция.
Мы "передаём" компилятору кусок кода для `std::hash`. Алгоритм:
1. Вычисляется хэш первого поля через стандартный `hash<string>()` или `hash<double>()`.
2. Вычисляется хэш второго ключевого поля.
3. Хэши смешиваются с помощью оператора `^` (Исключающее ИЛИ / XOR) и `<<` (побитовый сдвиг влево), получая одно уникальное число `size_t`. Сдвиг нужен для того, чтобы комбинация была ассиметричной: `hash(a, b) != hash(b, a)`.

---

## 3. Вставка и использование

```cpp
    set<Employee> orderedSet;
    unordered_set<Employee> hashSet;
    
    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
```
В отличие от массива (`vector`), где мы писали `push_back(tempObj)` (засунуть в конец), деревья и таблицы не имеют "конца" в классическом понимании. Для них существует метод `insert()`. 
- Для `set`: метод `insert()` сам вычисляет правильное место в красно-чёрном дереве, используя наш `operator<`. Элементы автоматически оказываются отсортированными.
- Для `unordered_set`: метод `insert()` вычисляет хэш объекта (через `std::hash`), определяет номер bucket-а и помещает элемент туда. Если bucket уже занят (коллизия), используется `operator==` для проверки на дубликат.

### Вывод
```cpp
    cout << "Дерево set (Сортировка по ФИО):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }
```
Обход дерева `set` через range-based `for` гарантированно выдаёт элементы в **отсортированном порядке** (по ФИО).
Обход `unordered_set` выдаёт элементы в **произвольном порядке**, зависящем от значений хэшей.
