# Разбор кода: Лабораторная работа 3 (Вариант 23)

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

    virtual double perimeter() const {
        return 4 * side;
    }

    virtual void print() const {
        cout << "Квадрат:" << endl;
        cout << "  Сторона: " << side << endl;
        cout << "  Периметр: " << perimeter() << endl;
    }

    virtual ~Square() {}
};

class RectangleD : public Square {
private:
    double side2;

public:
    RectangleD(double a, double b) : Square(a), side2(b) {}

    double perimeter() const override {
        return 2 * (side + side2);
    }

    void print() const override {
        cout << "Прямоугольник:" << endl;
        cout << "  Сторона a: " << side << endl;
        cout << "  Сторона b: " << side2 << endl;
        cout << "  Периметр: " << perimeter() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Square sq(5.0);
    RectangleD rect(4.0, 6.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    sq.print();
    cout << endl;
    rect.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Square* ptr_s1 = &sq;
    Square* ptr_s2 = &rect;

    cout << "\n[Явный вызов базового метода] ptr_s2->Square::print():" << endl;
    ptr_s2->Square::print();

    cout << "\n[Явный вызов базового perimeter()] ptr_s2->Square::perimeter():" << endl;
    cout << "  Результат (периметр квадрата): " << ptr_s2->Square::perimeter() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_s1->print() (указывает на Square):" << endl;
    ptr_s1->print();

    cout << "\nВызов ptr_s2->print() (указывает на RectangleD):" << endl;
    ptr_s2->print();

    cout << "\nВызов ptr_s2->perimeter() (указывает на RectangleD):" << endl;
    cout << "  Результат (периметр прямоугольника): " << ptr_s2->perimeter() << endl;

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
- Поле `side` (длина стороны квадрата) объявлено как **`protected`**. Это означает, что из `main()` обратиться к нему нельзя (`sq.side = 5` — ошибка компиляции), но наследник `RectangleD` может использовать его напрямую.
- Если бы мы использовали `private`, наследнику пришлось бы обращаться к полю через геттер, что менее удобно.

```cpp
public:
    Square(double s) : side(s) {{}}
```
- Конструктор принимает длину стороны и инициализирует поле через **список инициализации** `: side(s)`. Это более эффективный способ инициализации в С++, чем присвоение в теле конструктора.

```cpp
    virtual double perimeter() const {{
        return 4 * side;
    }}
```
- Виртуальный метод для вычисления **периметра квадрата**: P = 4 × side.
- **`virtual`** позволяет наследнику переопределить формулу на формулу для прямоугольника.
- **`const`** — метод не изменяет объект.

```cpp
    virtual void print() const {{
        cout << "Квадрат:" << endl;
        cout << "  Сторона: " << side << endl;
        cout << "  Периметр: " << perimeter() << endl;
    }}
```
- Виртуальный метод печати. Внутри вызывается `perimeter()`, который благодаря виртуальности вызовет правильную версию в зависимости от реального типа объекта.

```cpp
    virtual ~Square() {{}}
```
- Виртуальный деструктор обязателен для базовых классов при работе с полиморфизмом.

---

## 2. Производный Класс `RectangleD`

```cpp
class RectangleD : public Square {{
private:
    double side2;
```
- Класс наследует `side` от `Square` (она станет стороной `a`) и добавляет `side2` (сторона `b`).
- Имя `RectangleD` используется, чтобы не конфликтовать с возможными стандартными определениями.

```cpp
    RectangleD(double a, double b) : Square(a), side2(b) {{}}
```
- Конструктор вызывает `Square(a)` для инициализации первой стороны, затем инициализирует вторую сторону `side2(b)`.

```cpp
    double perimeter() const override {{
        return 2 * (side + side2);
    }}
```
- Переопределённый метод. Вместо периметра квадрата (4 × side) вычисляет **периметр прямоугольника**: P = 2 × (a + b).
- Поле `side` доступно напрямую благодаря `protected`, поэтому формула использует `side + side2`.
- **`override`** гарантирует, что сигнатура совпадает с базовым виртуальным методом.

```cpp
    void print() const override {{
        cout << "Прямоугольник:" << endl;
        cout << "  Сторона a: " << side << endl;
        cout << "  Сторона b: " << side2 << endl;
        cout << "  Периметр: " << perimeter() << endl;
    }}
```
- Переопределённая печать. Выводит обе стороны и периметр прямоугольника.

---

## 3. Полиморфизм в `main`

```cpp
    Square sq(5.0);
    RectangleD rect(4.0, 6.0);
```
- Создаются квадрат со стороной 5 (периметр 20) и прямоугольник 4×6 (периметр 20).

```cpp
    Square* ptr_s2 = &rect;
```
- Указатель базового типа `Square*` указывает на `RectangleD`. Прямоугольник — это «расширенный квадрат», поэтому приведение типа безопасно.

### Статическое связывание
```cpp
    ptr_s2->Square::print();
    ptr_s2->Square::perimeter();
```
- Явная квалификация `Square::` заставляет вызвать базовый метод. `perimeter()` вычислит `4 × 4 = 16` (как для квадрата), а не `2 × (4 + 6) = 20` (как для прямоугольника).

### Динамическое связывание
```cpp
    ptr_s2->print();
    ptr_s2->perimeter();
```
- Без квалификации программа через vtable определяет реальный тип (`RectangleD`) и вызывает его методы. `perimeter()` вернёт `2 × (4 + 6) = 20`.
