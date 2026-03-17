# Разбор кода: Лабораторная работа 3 (Вариант 28)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением конструкций наследования и полиморфизма.

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>
#include <cmath>

using namespace std;

class BankAccount {
protected:
    string owner;
    double initialSum;
    double rate;       // % годовых
    int years;         // время существования вклада

public:
    BankAccount(string o, double s, double r, int y)
        : owner(o), initialSum(s), rate(r), years(y) {}

    virtual double calcSum() const {
        return initialSum * pow(1.0 + rate / 100.0, years);
    }

    virtual void print() const {
        cout << "Банковский счёт:" << endl;
        cout << "  Владелец: " << owner << endl;
        cout << "  Начальная сумма: " << initialSum << " руб." << endl;
        cout << "  Ставка: " << rate << "% годовых" << endl;
        cout << "  Срок вклада: " << years << " лет" << endl;
        cout << "  Сумма на счёте: " << calcSum() << " руб." << endl;
    }

    virtual ~BankAccount() {}
};

class PrivilegedAccount : public BankAccount {
private:
    double creditRate;  // % кредита от суммы на счёте

public:
    PrivilegedAccount(string o, double s, double r, int y, double cr)
        : BankAccount(o, s, r, y), creditRate(cr) {}

    double calcSum() const override {
        double base = BankAccount::calcSum();
        return base + base * (creditRate / 100.0);
    }

    void print() const override {
        BankAccount::print();
        cout << "  Тип: Привилегированный счёт" << endl;
        cout << "  Процент кредита: " << creditRate << "%" << endl;
        cout << "  Сумма с кредитом: " << calcSum() << " руб." << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    BankAccount ba("Иванов Иван Иванович", 100000, 5.0, 3);
    PrivilegedAccount pa("Петров Пётр Петрович", 200000, 7.0, 5, 15.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    ba.print();
    cout << endl;
    pa.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    BankAccount* ptr_b1 = &ba;
    BankAccount* ptr_b2 = &pa;

    cout << "\n[Явный вызов базового метода] ptr_b2->BankAccount::print():" << endl;
    ptr_b2->BankAccount::print();

    cout << "\n[Явный вызов базового calcSum()] ptr_b2->BankAccount::calcSum():" << endl;
    cout << "  Результат (без кредита): " << ptr_b2->BankAccount::calcSum() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_b1->print() (указывает на BankAccount):" << endl;
    ptr_b1->print();

    cout << "\nВызов ptr_b2->print() (указывает на PrivilegedAccount):" << endl;
    ptr_b2->print();

    cout << "\nВызов ptr_b2->calcSum() (указывает на PrivilegedAccount):" << endl;
    cout << "  Результат (с кредитом): " << ptr_b2->calcSum() << endl;

    return 0;
}

```

---

## 1. Базовый Класс `BankAccount`

```cpp
class BankAccount {{
protected:
    string owner;
    double initialSum;
    double rate;
    int years;
```
- Четыре поля, все `protected`:
  - `owner` — ФИО владельца счёта.
  - `initialSum` — начальная сумма вклада.
  - `rate` — ставка вклада (% годовых).
  - `years` — время существования вклада в годах.
- **`protected`** обеспечивает доступ из наследника `PrivilegedAccount`, но запрещает из `main()`.

```cpp
    BankAccount(string o, double s, double r, int y)
        : owner(o), initialSum(s), rate(r), years(y) {{}}
```
- Конструктор инициализирует все четыре поля через **список инициализации**.

```cpp
    virtual double calcSum() const {{
        return initialSum * pow(1.0 + rate / 100.0, years);
    }}
```
- Вычисление суммы по формуле **сложных процентов**: S = P × (1 + r/100)ⁿ, где P — начальная сумма, r — ставка, n — срок.
- Функция `pow()` из `<cmath>` возводит в степень.
- Пример: 100000 × (1.05)³ = 115762.5.
- **`virtual`** позволяет привилегированному счёту переопределить расчёт с учётом кредита.

```cpp
    virtual void print() const {{
        cout << "Банковский счёт:" << endl;
        cout << "  Владелец: " << owner << endl;
        cout << "  Начальная сумма: " << initialSum << " руб." << endl;
        cout << "  Ставка: " << rate << "% годовых" << endl;
        cout << "  Срок вклада: " << years << " лет" << endl;
        cout << "  Сумма на счёте: " << calcSum() << " руб." << endl;
    }}
```
- Виртуальный метод печати. Вызывает `calcSum()` — через виртуальность будет вызвана правильная версия.

```cpp
    virtual ~BankAccount() {{}}
```
- Виртуальный деструктор.

---

## 2. Производный Класс `PrivilegedAccount`

```cpp
class PrivilegedAccount : public BankAccount {{
private:
    double creditRate;
```
- Наследует все 4 поля и добавляет `creditRate` — процент доступного кредита от суммы на счёте.

```cpp
    PrivilegedAccount(string o, double s, double r, int y, double cr)
        : BankAccount(o, s, r, y), creditRate(cr) {{}}
```
- Конструктор вызывает `BankAccount(o, s, r, y)` для базовой части, затем инициализирует `creditRate`.

```cpp
    double calcSum() const override {{
        double base = BankAccount::calcSum();
        return base + base * (creditRate / 100.0);
    }}
```
- **Ключевой момент:** сначала вызывается `BankAccount::calcSum()` для расчёта суммы с процентами, затем добавляется доступный кредит (% от этой суммы).
- Пример: сумма с процентами = 280510, кредит 15% → 280510 + 280510 × 0.15 = 322587.

```cpp
    void print() const override {{
        BankAccount::print();
        cout << "  Тип: Привилегированный счёт" << endl;
        cout << "  Процент кредита: " << creditRate << "%" << endl;
        cout << "  Сумма с кредитом: " << calcSum() << " руб." << endl;
    }}
```
- **Сначала** `BankAccount::print()` выводит общую информацию о счёте, затем добавляется информация о кредите.

---

## 3. Полиморфизм в `main`

```cpp
    BankAccount ba("Иванов Иван Иванович", 100000, 5.0, 3);
    PrivilegedAccount pa("Петров Пётр Петрович", 200000, 7.0, 5, 15.0);
```
- Обычный вклад (100000, 5%, 3 года) и привилегированный (200000, 7%, 5 лет, кредит 15%).

```cpp
    BankAccount* ptr_b2 = &pa;
```
- `BankAccount*` указывает на `PrivilegedAccount`.

### Статическое связывание
```cpp
    ptr_b2->BankAccount::print();
    ptr_b2->BankAccount::calcSum();
```
- Явная квалификация вызывает базовые методы. `calcSum()` считает **без** кредита.

### Динамическое связывание
```cpp
    ptr_b2->print();
    ptr_b2->calcSum();
```
- Через vtable вызываются методы `PrivilegedAccount`. `calcSum()` возвращает сумму **с** учётом кредита.
