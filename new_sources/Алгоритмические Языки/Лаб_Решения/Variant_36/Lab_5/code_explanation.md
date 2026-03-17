# Разбор кода: Лабораторная работа 5 (Вариант 36)

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

class Car {
private:
    string model;
    double fuel[3]; // трасса, город, смешанный
    double maxSpeed;
    int power;

public:
    Car() : model(""), maxSpeed(0), power(0) { fuel[0]=fuel[1]=fuel[2]=0; }

    Car(string m, double f1, double f2, double f3, double s, int p)
        : model(move(m)), maxSpeed(s), power(p) {
        fuel[0]=f1; fuel[1]=f2; fuel[2]=f3;
    }

    const string& getModel() const { return model; }
    double getMixedFuel() const { return fuel[2]; }
    double getMaxSpeed() const { return maxSpeed; }
    int getPower() const { return power; }

    bool operator<(const Car& other) const {
        if (model != other.model) return model < other.model;
        return power < other.power;
    }

    bool operator==(const Car& other) const {
        return (model == other.model &&
                fuel[0]==other.fuel[0] && fuel[1]==other.fuel[1] && fuel[2]==other.fuel[2] &&
                maxSpeed == other.maxSpeed &&
                power == other.power);
    }

    friend ostream& operator<<(ostream& os, const Car& c) {
        os << "Авто: " << c.model << ", Расход (трасса/город/смеш): "
           << c.fuel[0] << "/" << c.fuel[1] << "/" << c.fuel[2]
           << " л/100км, Макс: " << c.maxSpeed << " км/ч, " << c.power << " л.с.";
        return os;
    }

    friend istream& operator>>(istream& is, Car& c) {
        is >> c.model >> c.fuel[0] >> c.fuel[1] >> c.fuel[2] >> c.maxSpeed >> c.power;
        return is;
    }
};

namespace std {
    template<>
    struct hash<Car> {
        size_t operator()(const Car& obj) const {
            size_t h1 = hash<string>()(obj.getModel());
            size_t h2 = hash<int>()(obj.getPower());
            return h1 ^ (h2 << 1);
        }
    };
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    set<Car> orderedSet;
    unordered_set<Car> hashSet;
    
    Car tempObj;

    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
    fin.close();

    cout << "Дерево set (Сортировка по названию модели):\n";
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
    bool operator<(const Car& other) const {
        if (model != other.model) return model < other.model;
        return power < other.power;
    }
```
Контейнер `set` постоянно сортирует элементы "на лету", расставляя их по веткам бинарного дерева поиска (Red-Black Tree). Для этого ему нужна **только** одна операция: проверка на `<` (меньше).

Особенность работы дерева: оно считает два объекта **абсолютно одинаковыми** (и удаляет дубликат), если `A не меньше B, и B не меньше A`. 
Если бы мы проверяли **только** поле `model`:
- Два объекта с одинаковым значением `model` считались бы эквивалентными.
- `!(model_a < model_b)` и `!(model_b < model_a)` — оба ложные, значит дерево решит, что это **одна и та же** запись и выбросит вторую.

Мы избегаем этого, добавляя дополнительный критерий `power` в случае равных значений основного поля (составное/каскадное условие сортировки).

---

## 2. Как работает `unordered_set`

### Оператор равенства `==`
```cpp
    bool operator==(const Car& other) const {
        return (model == other.model &&
                fuel[0]==other.fuel[0] && fuel[1]==other.fuel[1] && fuel[2]==other.fuel[2] &&
                maxSpeed == other.maxSpeed &&
                power == other.power);
    }
```
Хэш-контейнеры не используют сортировку. Они кладут объект в "ящик" (bucket). Чтобы проверить два объекта на совпадение в этом "ящике" (при коллизии хэшей), им нужен явный **оператор равенства** `==`. Мы сравниваем **все** поля объекта на точное совпадение.

### Специализация `std::hash`
```cpp
namespace std {
    template<>
    struct hash<Car> {
        size_t operator()(const Car& obj) const {
            size_t h1 = hash<string>()(obj.getModel());
            size_t h2 = hash<int>()(obj.getPower());
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
    set<Car> orderedSet;
    unordered_set<Car> hashSet;
    
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
    cout << "Дерево set (Сортировка по названию модели):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }
```
Обход дерева `set` через range-based `for` гарантированно выдаёт элементы в **отсортированном порядке** (по названию модели).
Обход `unordered_set` выдаёт элементы в **произвольном порядке**, зависящем от значений хэшей.
