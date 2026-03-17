# Разбор кода: Лабораторная работа 3 (Вариант 31)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением конструкций наследования и полиморфизма.

## Полный исходный код программы
```cpp
#include <iostream>

using namespace std;

class Square {
protected:
    double side;

public:
    Square(double s) : side(s) {}

    virtual double calculate() const {
        return side * side;
    }

    virtual void print() const {
        cout << "Квадрат:" << endl;
        cout << "  Сторона: " << side << endl;
        cout << "  Площадь: " << calculate() << endl;
    }

    virtual ~Square() {}
};

class Cube : public Square {
public:
    Cube(double s) : Square(s) {}

    double calculate() const override {
        return Square::calculate() * side;
    }

    void print() const override {
        cout << "Куб:" << endl;
        cout << "  Сторона: " << side << endl;
        cout << "  Площадь одной грани: " << Square::calculate() << endl;
        cout << "  Объём: " << calculate() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Square sq(5.0);
    Cube cu(3.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    sq.print();
    cout << endl;
    cu.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Square* ptr_s1 = &sq;
    Square* ptr_s2 = &cu;

    cout << "\n[Явный вызов базового метода] ptr_s2->Square::print():" << endl;
    ptr_s2->Square::print();

    cout << "\n[Явный вызов базового calculate()] ptr_s2->Square::calculate():" << endl;
    cout << "  Результат (площадь квадрата): " << ptr_s2->Square::calculate() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_s1->print() (указывает на Square):" << endl;
    ptr_s1->print();

    cout << "\nВызов ptr_s2->print() (указывает на Cube):" << endl;
    ptr_s2->print();

    cout << "\nВызов ptr_s2->calculate() (указывает на Cube):" << endl;
    cout << "  Результат (объём куба): " << ptr_s2->calculate() << endl;

    return 0;
}

```

---

## 1. Базовый Класс `Square`

```cpp
class Square {{
protected:
    double side;
```
- Поле `side` (длина стороны квадрата) объявлено как **`protected`** — оно недоступно из внешнего кода (`main`), но доступно классу-наследнику `Cube`. Если бы мы использовали `private`, наследник не смог бы напрямую обращаться к `side`.

```cpp
public:
    Square(double s) : side(s) {{}}
```
- Конструктор принимает длину стороны и инициализирует поле через **список инициализации** `: side(s)`.

```cpp
    virtual double calculate() const {{
        return side * side;
    }}
```
- Виртуальный метод, вычисляющий площадь квадрата: side × side.
- **`virtual`** позволяет наследнику `Cube` переопределить эту функцию для вычисления объёма вместо площади.

```cpp
    virtual void print() const {{
        cout << "Квадрат:" << endl;
        cout << "  Сторона: " << side << endl;
        cout << "  Площадь: " << calculate() << endl;
    }}
```
- Виртуальный метод печати. Внутри вызывается `calculate()` — благодаря виртуальности, при вызове через указатель будет использована правильная версия (площадь или объём).

```cpp
    virtual ~Square() {{}}
```
- Виртуальный деструктор обязателен для базовых классов.

---

## 2. Производный Класс `Cube`

```cpp
class Cube : public Square {{
public:
    Cube(double s) : Square(s) {{}}
```
- `Cube` наследуется от `Square` публично. Новых полей не добавляет — куб определяется той же стороной, что и квадрат.
- Конструктор **передаёт** сторону конструктору базового класса `Square(s)`.

```cpp
    double calculate() const override {{
        return Square::calculate() * side;
    }}
```
- Переопределённый метод. Вместо площади (side²) вычисляет **объём** куба (side³).
- **Ключевой момент по заданию:** внутри переопределённой функции **вызывается функция базового класса** `Square::calculate()`, которая возвращает side². Затем результат умножается на `side`, давая side³ = объём.
- **`override`** гарантирует, что мы действительно переопределяем виртуальный метод родителя, а не создаём новый.

```cpp
    void print() const override {{
        cout << "Куб:" << endl;
        cout << "  Сторона: " << side << endl;
        cout << "  Площадь одной грани: " << Square::calculate() << endl;
        cout << "  Объём: " << calculate() << endl;
    }}
```
- Переопределённая печать. Выводит и площадь грани (через `Square::calculate()`), и объём (через свой `calculate()`).

---

## 3. Полиморфизм в `main`

```cpp
    Square* ptr_s2 = &cu;
```
- Указатель базового типа `Square*` указывает на объект `Cube`. Это разрешено — наследник **является** разновидностью базового типа (куб — это «расширенный квадрат»).

### Статическое связывание
```cpp
    ptr_s2->Square::print();
    ptr_s2->Square::calculate();
```
- Явная квалификация `Square::` заставляет вызвать метод базового класса. `calculate()` вернёт площадь (side²), а не объём (side³).

### Динамическое связывание
```cpp
    ptr_s2->print();
    ptr_s2->calculate();
```
- Без явной квалификации программа использует vtable и вызывает методы `Cube`. `calculate()` вернёт объём, `print()` выведет информацию о кубе.
