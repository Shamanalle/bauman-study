# Разбор кода: Лабораторная работа 3 (Вариант 6)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением конструкций наследования и полиморфизма.

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>

using namespace std;

class Car {
protected:
    string model;
    double maxSpeed;

public:
    Car(string m, double s) : model(m), maxSpeed(s) {}

    virtual void print() const {
        cout << "Автомобиль:" << endl;
        cout << "  Модель: " << model << endl;
        cout << "  Макс. скорость: " << maxSpeed << " км/ч" << endl;
    }

    virtual ~Car() {}
};

class Truck : public Car {
private:
    double payload;

public:
    Truck(string m, double s, double p) : Car(m, s), payload(p) {}

    void print() const override {
        Car::print();
        cout << "  Тип: Грузовой автомобиль" << endl;
        cout << "  Грузоподъёмность: " << payload << " т" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Car car("Toyota Camry", 210);
    Truck truck("MAN TGX", 120, 18.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    car.print();
    cout << endl;
    truck.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Car* ptr_c1 = &car;
    Car* ptr_c2 = &truck;

    cout << "\n[Явный вызов базового метода] ptr_c2->Car::print():" << endl;
    ptr_c2->Car::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_c1->print() (указывает на Car):" << endl;
    ptr_c1->print();

    cout << "\nВызов ptr_c2->print() (указывает на Truck):" << endl;
    ptr_c2->print();

    return 0;
}

```

---

## 1. Базовый Класс `Car`

```cpp
class Car {{
protected:
    string model;
    double maxSpeed;
```
- Два поля, оба `protected`:
  - `model` — наименование модели автомобиля (тип `string` из `<string>`).
  - `maxSpeed` — максимальная скорость автомобиля в км/ч.
- **`protected`** обеспечивает, что extract извне (`main`) к полям обратиться нельзя, но наследник `Truck` может использовать их напрямую.

```cpp
public:
    Car(string m, double s) : model(m), maxSpeed(s) {{}}
```
- Конструктор принимает модель и скорость. Инициализирует поля через **список инициализации**.
- Обратите внимание: `string` передаётся по значению (копируется). В реальном коде для оптимизации можно использовать `const string&` или `string&&`.

```cpp
    virtual void print() const {{
        cout << "Автомобиль:" << endl;
        cout << "  Модель: " << model << endl;
        cout << "  Макс. скорость: " << maxSpeed << " км/ч" << endl;
    }}
```
- Виртуальный метод печати. Ключевое слово `virtual` позволяет наследнику `Truck` переопределить этот метод.
- `const` после скобок — метод не изменяет объект.

```cpp
    virtual ~Car() {{}}
```
- Виртуальный деструктор обязателен для базовых классов.

---

## 2. Производный Класс `Truck`

```cpp
class Truck : public Car {{
private:
    double payload;
```
- `Truck` наследует `model` и `maxSpeed` и добавляет поле `payload` (грузоподъёмность в тоннах).

```cpp
    Truck(string m, double s, double p) : Car(m, s), payload(p) {{}}
```
- Конструктор наследника **вызывает конструктор** базового класса `Car(m, s)` для инициализации модели и скорости. Затем инициализирует собственное поле `payload(p)`.

```cpp
    void print() const override {{
        Car::print();
        cout << "  Тип: Грузовой автомобиль" << endl;
        cout << "  Грузоподъёмность: " << payload << " т" << endl;
    }}
```
- **Ключевой момент задания:** внутри переопределённой функции **сначала вызывается** `Car::print()`. Это выводит общую информацию об автомобиле (модель и скорость), после чего `Truck` дополняет вывод типом и грузоподъёмностью.
- **`override`** (С++11) гарантирует, что мы переопределяем виртуальный метод, а не создаём новый.

---

## 3. Полиморфизм в `main`

```cpp
    Car car("Toyota Camry", 210);
    Truck truck("MAN TGX", 120, 18.0);
```
- Создаются два объекта: легковой автомобиль и грузовик.

```cpp
    Car* ptr_c1 = &car;
    Car* ptr_c2 = &truck;
```
- Оба указателя имеют тип `Car*`. Но `ptr_c2` указывает на `Truck`. Это безопасно, потому что `Truck` **является** расширенным `Car` (любой грузовик — это автомобиль).

### Статическое связывание
```cpp
    ptr_c2->Car::print();
```
- Явная квалификация `Car::` принудительно вызывает базовый метод. Будет выведена только модель и скорость, **без** информации о грузоподъёмности.
- Компилятор на этапе компиляции привязывает вызов к `Car::print()`.

### Динамическое связывание
```cpp
    ptr_c2->print();
```
- Без квалификации программа через vtable находит реальный тип объекта (`Truck`) и вызывает `Truck::print()`. Будет выведена **полная** информация: модель, скорость, тип и грузоподъёмность.
