# Разбор кода: Лабораторная работа 3 (Вариант 10)

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

class Bus : public Car {
private:
    int maxPassengers;

public:
    Bus(string m, double s, int p) : Car(m, s), maxPassengers(p) {}

    void print() const override {
        Car::print();
        cout << "  Тип: Автобус" << endl;
        cout << "  Макс. пассажиров: " << maxPassengers << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Car car("Toyota Camry", 210);
    Bus bus("ЛиАЗ-5292", 80, 110);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    car.print();
    cout << endl;
    bus.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Car* ptr_c1 = &car;
    Car* ptr_c2 = &bus;

    cout << "\n[Явный вызов базового метода] ptr_c2->Car::print():" << endl;
    ptr_c2->Car::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_c1->print() (указывает на Car):" << endl;
    ptr_c1->print();

    cout << "\nВызов ptr_c2->print() (указывает на Bus):" << endl;
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
  - `model` — наименование модели (тип `string` из заголовочного файла `<string>`).
  - `maxSpeed` — максимальная скорость в км/ч.
- **`protected`** обеспечивает, что из `main()` к полям обратиться нельзя, но наследник `Bus` может использовать их напрямую.

```cpp
public:
    Car(string m, double s) : model(m), maxSpeed(s) {{}}
```
- Конструктор принимает модель и скорость. **Список инициализации** `: model(m), maxSpeed(s)` — стандартный способ инициализации полей в C++.

```cpp
    virtual void print() const {{
        cout << "Автомобиль:" << endl;
        cout << "  Модель: " << model << endl;
        cout << "  Макс. скорость: " << maxSpeed << " км/ч" << endl;
    }}
```
- Виртуальный метод печати. **`virtual`** позволяет наследнику `Bus` переопределить этот метод для вывода дополнительной информации о пассажирах.

```cpp
    virtual ~Car() {{}}
```
- Виртуальный деструктор обязателен для базовых классов.

---

## 2. Производный Класс `Bus`

```cpp
class Bus : public Car {{
private:
    int maxPassengers;
```
- `Bus` наследует `model` и `maxSpeed` и добавляет `maxPassengers` — макс. число пассажиров.

```cpp
    Bus(string m, double s, int p) : Car(m, s), maxPassengers(p) {{}}
```
- Конструктор **вызывает конструктор** базового класса `Car(m, s)`, затем инициализирует собственное поле. Без явного вызова `Car(m, s)` компилятор попытается вызвать `Car()` без аргументов — ошибка компиляции.

```cpp
    void print() const override {{
        Car::print();
        cout << "  Тип: Автобус" << endl;
        cout << "  Макс. пассажиров: " << maxPassengers << endl;
    }}
```
- **Ключевой момент задания:** внутри переопределённой функции **сначала вызывается** `Car::print()`. Это выводит модель и скорость, после чего добавляется тип транспорта и число пассажиров.
- **`override`** обеспечивает проверку соответствия сигнатуры с базовым методом.

---

## 3. Полиморфизм в `main`

```cpp
    Car car("Toyota Camry", 210);
    Bus bus("ЛиАЗ-5292", 80, 110);
```
- Создаются легковой автомобиль и автобус (модель ЛиАЗ-5292, скорость 80 км/ч, 110 пассажиров).

```cpp
    Car* ptr_c2 = &bus;
```
- Указатель `Car*` указывает на `Bus`. Автобус — это «расширенный автомобиль», присвоение безопасно.

### Статическое связывание
```cpp
    ptr_c2->Car::print();
```
- Явная квалификация `Car::` вызывает только базовый метод: только модель и скорость, **без** пассажиров.

### Динамическое связывание
```cpp
    ptr_c2->print();
```
- Без квалификации программа через **vtable** определяет реальный тип (`Bus`) и вызывает `Bus::print()`. Выводится **полная** информация включая число пассажиров.
