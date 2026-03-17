# Разбор кода: Лабораторная работа 3 (Вариант 32)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением конструкций наследования и полиморфизма.

## Полный исходный код программы
```cpp
#include <iostream>

using namespace std;

class Rectangle {
protected:
    double a, b;

public:
    Rectangle(double a, double b) : a(a), b(b) {}

    virtual double calculate() const {
        return a * b;
    }

    virtual void print() const {
        cout << "Прямоугольник:" << endl;
        cout << "  Стороны: a = " << a << ", b = " << b << endl;
        cout << "  Площадь: " << calculate() << endl;
    }

    virtual ~Rectangle() {}
};

class Parallelepiped : public Rectangle {
private:
    double h;

public:
    Parallelepiped(double a, double b, double h) : Rectangle(a, b), h(h) {}

    double calculate() const override {
        return Rectangle::calculate() * h;
    }

    void print() const override {
        Rectangle::print();
        cout << "  Параллелепипед:" << endl;
        cout << "  Высота: h = " << h << endl;
        cout << "  Объём: " << calculate() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Rectangle rect(5.0, 3.0);
    Parallelepiped par(4.0, 6.0, 2.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    rect.print();
    cout << endl;
    par.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Rectangle* ptr_r1 = &rect;
    Rectangle* ptr_r2 = &par;

    cout << "\n[Явный вызов базового метода] ptr_r2->Rectangle::print():" << endl;
    ptr_r2->Rectangle::print();

    cout << "\n[Явный вызов базового calculate()] ptr_r2->Rectangle::calculate():" << endl;
    cout << "  Результат (площадь): " << ptr_r2->Rectangle::calculate() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_r1->print() (указывает на Rectangle):" << endl;
    ptr_r1->print();

    cout << "\nВызов ptr_r2->print() (указывает на Parallelepiped):" << endl;
    ptr_r2->print();

    cout << "\nВызов ptr_r2->calculate() (указывает на Parallelepiped):" << endl;
    cout << "  Результат (объём): " << ptr_r2->calculate() << endl;

    return 0;
}

```

---

## 1. Базовый Класс `Rectangle`

```cpp
class Rectangle {{
protected:
    double a, b;
```
- Поля `a` и `b` (длины сторон прямоугольника) объявлены как **`protected`**. Из `main` к ним обратиться нельзя (`rect.a = 5` — ошибка), но наследник `Parallelepiped` может использовать их напрямую.

```cpp
public:
    Rectangle(double a, double b) : a(a), b(b) {{}}
```
- Конструктор с двумя параметрами. Инициализирует обе стороны через **список инициализации**.

```cpp
    virtual double calculate() const {{
        return a * b;
    }}
```
- Виртуальный метод, вычисляющий площадь: a × b. Ключевое слово `virtual` позволяет наследнику переопределить эту функцию для вычисления объёма.

```cpp
    virtual void print() const {{
        cout << "Прямоугольник:" << endl;
        cout << "  Стороны: a = " << a << ", b = " << b << endl;
        cout << "  Площадь: " << calculate() << endl;
    }}
```
- Виртуальный метод печати. Внутри вызывается `calculate()`, который благодаря виртуальности автоматически подставит правильную версию.

```cpp
    virtual ~Rectangle() {{}}
```
- Виртуальный деструктор — обязателен для базовых классов при работе с полиморфизмом.

---

## 2. Производный Класс `Parallelepiped`

```cpp
class Parallelepiped : public Rectangle {{
private:
    double h;
```
- Класс наследует `a` и `b` от `Rectangle` и добавляет собственное поле `h` (высота).

```cpp
    Parallelepiped(double a, double b, double h) : Rectangle(a, b), h(h) {{}}
```
- Конструктор наследника вызывает конструктор базового класса `Rectangle(a, b)` для инициализации родительской части, затем инициализирует `h`.

```cpp
    double calculate() const override {{
        return Rectangle::calculate() * h;
    }}
```
- Переопределённый метод. Вычисляет **объём** параллелепипеда: площадь основания × высота.
- **Вызов базового метода** `Rectangle::calculate()` возвращает a × b (площадь основания), затем умножается на `h`.

```cpp
    void print() const override {{
        Rectangle::print();
        cout << "  Параллелепипед:" << endl;
        cout << "  Высота: h = " << h << endl;
        cout << "  Объём: " << calculate() << endl;
    }}
```
- Переопределённая печать. **Сначала вызывается** `Rectangle::print()` (выводит стороны и площадь основания), затем добавляется информация о высоте и объёме.

---

## 3. Полиморфизм в `main`

```cpp
    Rectangle* ptr_r2 = &par;
```
- Указатель базового типа `Rectangle*` указывает на объект `Parallelepiped`. Параллелепипед — это «расширенный прямоугольник», поэтому такое присвоение безопасно.

### Статическое связывание
```cpp
    ptr_r2->Rectangle::print();
    ptr_r2->Rectangle::calculate();
```
- Явная квалификация `Rectangle::` принудительно вызывает базовые методы. `calculate()` вернёт площадь (a × b = 24), а не объём.

### Динамическое связывание
```cpp
    ptr_r2->print();
    ptr_r2->calculate();
```
- Без квалификации программа заглядывает в vtable объекта, видит реальный тип `Parallelepiped` и вызывает его методы. `calculate()` вернёт объём (a × b × h = 48), `print()` выведет полную информацию о параллелепипеде.
