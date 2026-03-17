# Разбор кода: Лабораторная работа 3 (Вариант 13)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением конструкций наследования и полиморфизма.

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>

using namespace std;

class Employee {
protected:
    string name;
    double salary;
    double bonusPerYear;  // % от оклада за 1 год стажа
    int experience;       // стаж в годах

public:
    Employee(string n, double s, double b, int e)
        : name(n), salary(s), bonusPerYear(b), experience(e) {}

    virtual double calcSalary() const {
        return salary + salary * (bonusPerYear / 100.0) * experience;
    }

    virtual void print() const {
        cout << "Сотрудник:" << endl;
        cout << "  ФИО: " << name << endl;
        cout << "  Оклад: " << salary << " руб." << endl;
        cout << "  Надбавка за стаж: " << bonusPerYear << "% за год" << endl;
        cout << "  Стаж: " << experience << " лет" << endl;
        cout << "  Зарплата: " << calcSalary() << " руб." << endl;
    }

    virtual ~Employee() {}
};

class Manager : public Employee {
private:
    double managerBonus;  // % надбавка за руководство
    string department;

public:
    Manager(string n, double s, double b, int e, double mb, string dept)
        : Employee(n, s, b, e), managerBonus(mb), department(dept) {}

    double calcSalary() const override {
        return Employee::calcSalary() + salary * (managerBonus / 100.0);
    }

    void print() const override {
        Employee::print();
        cout << "  Должность: Начальник подразделения" << endl;
        cout << "  Подразделение: " << department << endl;
        cout << "  Надбавка за руководство: " << managerBonus << "%" << endl;
        cout << "  Итого зарплата начальника: " << calcSalary() << " руб." << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Employee emp("Иванов Иван Иванович", 50000, 2.0, 10);
    Manager mgr("Петров Пётр Петрович", 70000, 1.5, 15, 25.0, "IT-отдел");

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    emp.print();
    cout << endl;
    mgr.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Employee* ptr_e1 = &emp;
    Employee* ptr_e2 = &mgr;

    cout << "\n[Явный вызов базового метода] ptr_e2->Employee::print():" << endl;
    ptr_e2->Employee::print();

    cout << "\n[Явный вызов базового calcSalary()] ptr_e2->Employee::calcSalary():" << endl;
    cout << "  Результат (зарплата сотрудника): " << ptr_e2->Employee::calcSalary() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_e1->print() (указывает на Employee):" << endl;
    ptr_e1->print();

    cout << "\nВызов ptr_e2->print() (указывает на Manager):" << endl;
    ptr_e2->print();

    cout << "\nВызов ptr_e2->calcSalary() (указывает на Manager):" << endl;
    cout << "  Результат (зарплата начальника): " << ptr_e2->calcSalary() << endl;

    return 0;
}

```

---

## 1. Базовый Класс `Employee`

```cpp
class Employee {{
protected:
    string name;
    double salary;
    double bonusPerYear;
    int experience;
```
- Четыре поля, все `protected`:
  - `name` — ФИО сотрудника.
  - `salary` — оклад в рублях.
  - `bonusPerYear` — процент надбавки за каждый год стажа.
  - `experience` — стаж в годах.
- **`protected`** обеспечивает доступ из наследника `Manager`, но закрывает извне.

```cpp
    Employee(string n, double s, double b, int e)
        : name(n), salary(s), bonusPerYear(b), experience(e) {{}}
```
- Конструктор с четырьмя параметрами. **Список инициализации** инициализирует все поля.

```cpp
    virtual double calcSalary() const {{
        return salary + salary * (bonusPerYear / 100.0) * experience;
    }}
```
- Виртуальный метод расчёта зарплаты сотрудника: оклад + оклад × (надбавка/100) × стаж.
- Пример: оклад 50000, надбавка 2% за год, стаж 10 лет → 50000 + 50000 × 0.02 × 10 = 60000.
- **`virtual`** позволяет начальнику переопределить расчёт с учётом надбавки за руководство.

```cpp
    virtual void print() const {{
        cout << "Сотрудник:" << endl;
        cout << "  ФИО: " << name << endl;
        cout << "  Оклад: " << salary << " руб." << endl;
        cout << "  Надбавка за стаж: " << bonusPerYear << "% за год" << endl;
        cout << "  Стаж: " << experience << " лет" << endl;
        cout << "  Зарплата: " << calcSalary() << " руб." << endl;
    }}
```
- Виртуальный метод печати. Внутри вызывается `calcSalary()` — благодаря виртуальности, через указатель будет вызвана правильная версия (для сотрудника или для начальника).

```cpp
    virtual ~Employee() {{}}
```
- Виртуальный деструктор.

---

## 2. Производный Класс `Manager`

```cpp
class Manager : public Employee {{
private:
    double managerBonus;
    string department;
```
- Наследует все 4 поля и добавляет:
  - `managerBonus` — процентная надбавка к окладу за руководство.
  - `department` — название подразделения.

```cpp
    Manager(string n, double s, double b, int e, double mb, string dept)
        : Employee(n, s, b, e), managerBonus(mb), department(dept) {{}}
```
- Конструктор вызывает `Employee(n, s, b, e)` для базовой части и инициализирует свои два поля.

```cpp
    double calcSalary() const override {{
        return Employee::calcSalary() + salary * (managerBonus / 100.0);
    }}
```
- **Ключевой момент:** `Employee::calcSalary()` вызывается внутри и возвращает зарплату обычного сотрудника. К ней прибавляется надбавка за руководство (% от оклада).
- Пример: зарплата сотрудника 85750, оклад 70000, надбавка 25% → 85750 + 70000 × 0.25 = 103250.

```cpp
    void print() const override {{
        Employee::print();
        cout << "  Должность: Начальник подразделения" << endl;
        cout << "  Подразделение: " << department << endl;
        cout << "  Надбавка за руководство: " << managerBonus << "%" << endl;
        cout << "  Итого зарплата начальника: " << calcSalary() << " руб." << endl;
    }}
```
- **Сначала** `Employee::print()` выводит общую информацию, затем Manager дополняет должностью, подразделением и итоговой зарплатой.

---

## 3. Полиморфизм в `main`

```cpp
    Employee emp("Иванов Иван Иванович", 50000, 2.0, 10);
    Manager mgr("Петров Пётр Петрович", 70000, 1.5, 15, 25.0, "IT-отдел");
```
- Создаются обычный сотрудник и начальник IT-отдела.

```cpp
    Employee* ptr_e2 = &mgr;
```
- Указатель `Employee*` указывает на `Manager`. Начальник — «расширенный сотрудник».

### Статическое связывание
```cpp
    ptr_e2->Employee::print();
    ptr_e2->Employee::calcSalary();
```
- Явная квалификация `Employee::` вызывает базовые методы. `calcSalary()` вернёт зарплату **без** учёта надбавки за руководство.

### Динамическое связывание
```cpp
    ptr_e2->print();
    ptr_e2->calcSalary();
```
- Через vtable вызываются методы `Manager`. `calcSalary()` вернёт полную зарплату с надбавкой за руководство.
