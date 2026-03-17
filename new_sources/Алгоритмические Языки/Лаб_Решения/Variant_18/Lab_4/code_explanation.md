# Разбор кода: Лабораторная работа 4 (Вариант 18)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением реализации класса `Car` и использования алгоритмов STL.

## Полный исходный код программы
```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <list>
#include <vector>

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

    Car(const Car& other)
        : model(other.model), maxSpeed(other.maxSpeed), power(other.power) {
        for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
     {}

    Car(Car&& other) noexcept
        : model(move(other.model)), maxSpeed(other.maxSpeed), power(other.power) {
        for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
     {}

    Car& operator=(const Car& other) {
        if (this != &other) {
            model = other.model;
            for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
            maxSpeed = other.maxSpeed;
            power = other.power;
        }
        return *this;
    }

    Car& operator=(Car&& other) noexcept {
        if (this != &other) {
            model = move(other.model);
            for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
            maxSpeed = other.maxSpeed;
            power = other.power;
        }
        return *this;
    }

    string getModel() const { return model; }
    double getMixedFuel() const { return fuel[2]; }

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

bool compareByModel(const Car& a, const Car& b) {
    return a.getModel() < b.getModel();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    list<Car> items;
    Car temp;

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

    items.sort(compareByModel);

    fout << "\nОтсортированный контейнер (по названию модели):\n";
    cout << "\nОтсортированный контейнер (по названию модели):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    vector<Car> copied(items.size());
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

## 1. Класс `Car`

### Поля класса
```cpp
private:
    string model;
    double fuel[3]; // трасса, город, смешанный
    double maxSpeed;
    int power;
```
Поля класса объявлены как `private` — это стандартная инкапсуляция. Доступ к ним осуществляется через геттеры для чтения и оператор `>>` для записи.

### Конструкторы
```cpp
    Car() : model(""), maxSpeed(0), power(0) { fuel[0]=fuel[1]=fuel[2]=0; }
```
**Конструктор по умолчанию** необходим для работы с STL-контейнерами. Когда мы пишем `vector<Car> copied(items.size())`, контейнер создает `items.size()` объектов, вызывая для каждого конструктор по умолчанию.

```cpp
    Car(string m, double f1, double f2, double f3, double s, int p)
        : model(move(m)), maxSpeed(s), power(p) {
        fuel[0]=f1; fuel[1]=f2; fuel[2]=f3;
    }
```
**Конструктор с параметрами** инициализирует поля. Заметим `move()` для строковых полей. Поскольку строки (`string`) — это ресурсоемкие объекты, которые выделяют память динамически внутри себя, вместо того чтобы целиком копировать строку, мы **перемещаем** байты прямо в поле с помощью `move()`, что намного быстрее.

### Конструктор копирования и перемещения
```cpp
    Car(const Car& other)
        : model(other.model), maxSpeed(other.maxSpeed), power(other.power) {
        for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
     {}
```
**Конструктор копирования** создаёт полную копию объекта. Все поля копируются из `other`.

```cpp
    Car(Car&& other) noexcept
        : model(move(other.model)), maxSpeed(other.maxSpeed), power(other.power) {
        for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
     {}
```
**Конструктор перемещения** оптимизирует передачу объектов в памяти (например, при вызове `push_back` и расширении массива под капотом вектора). `noexcept` указывает, что этот метод никогда не выбросит исключение — тогда STL-контейнеры будут использовать его вместо медленного конструктора копирования.

### Операторы присваивания
```cpp
    Car& operator=(const Car& other) {
        if (this != &other) {
            model = other.model;
            for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
            maxSpeed = other.maxSpeed;
            power = other.power;
        }
        return *this;
    }
```
**Оператор копирующего присваивания**. Проверка `if (this != &other)` предотвращает саморазрушение при `a = a`.

```cpp
    Car& operator=(Car&& other) noexcept { ... }
```
**Оператор перемещающего присваивания**. Аналогичен конструктору перемещения, но для уже существующих объектов. Используется алгоритмом `std::copy` при перезаписи элементов целевого контейнера.

### Операторы потокового ввода/вывода
```cpp
    friend istream& operator>>(istream& is, Car& c) {
        is >> c.model >> c.fuel[0] >> c.fuel[1] >> c.fuel[2] >> c.maxSpeed >> c.power;
        return is;
    }
```
Мы переопределяем оператор `>>`. Теперь мы можем просто писать `fin >> temp` и программа сама считает все поля из текстового файла, разбив их по пробелу. Оператор объявлен как **`friend`**, чтобы иметь доступ к `private` полям класса.

---

## 2. Логика функции `main`

### Чтение из файла
```cpp
    list<Car> items;
    Car temp;
    while (fin >> temp) {
        items.push_back(temp);
    }
```
Мы создаем контейнер `list`. В цикле `while` считываем по одному объекту из файла до тех пор, пока не достигнем его конца. Метод `push_back` вставляет элемент в конец контейнера, при необходимости самостоятельно увеличивая размер.

### Сортировка (Метод `list::sort`)
```cpp
items.sort(compareByModel);
```
Контейнер `list` предоставляет только двунаправленные итераторы (Bidirectional Iterator), а для алгоритма `std::sort` нужны итераторы произвольного доступа (Random Access Iterator). Поэтому у `list` есть **собственный метод** `sort()`, который принимает функцию-компаратор. Компаратор объясняет, какой элемент считать «меньшим» — сортировка по названию модели.

### Копирование (Алгоритм `std::copy`)
```cpp
    vector<Car> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());
```
По заданию мы копируем данные из `list` в `vector`.
1. Мы обязаны **выделить память** в целевом контейнере `copied` через конструктор `(items.size())`, потому что `std::copy` только перезаписывает уже выделенные ячейки (не выделяет новую память).
2. `std::copy` берёт элементы от `begin()` до `end()` исходного контейнера и последовательно присваивает (использует `operator=`) в целевой.
