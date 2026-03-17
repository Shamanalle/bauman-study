# Разбор кода: Лабораторная работа 3 (Вариант 11)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением конструкций наследования и полиморфизма.

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>

using namespace std;

class School {
protected:
    string name;
    int students;

public:
    School(string n, int s) : name(n), students(s) {}

    virtual void print() const {
        cout << "Школа:" << endl;
        cout << "  Название: " << name << endl;
        cout << "  Число учеников: " << students << endl;
    }

    virtual ~School() {}
};

class SpecialSchool : public School {
private:
    string specialization;

public:
    SpecialSchool(string n, int s, string spec) : School(n, s), specialization(spec) {}

    void print() const override {
        School::print();
        cout << "  Тип: Специализированная школа" << endl;
        cout << "  Специализация: " << specialization << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    School sch("Школа №1", 500);
    SpecialSchool ssch("Лицей №2", 300, "Математика и Информатика");

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    sch.print();
    cout << endl;
    ssch.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    School* ptr_s1 = &sch;
    School* ptr_s2 = &ssch;

    cout << "\n[Явный вызов базового метода] ptr_s2->School::print():" << endl;
    ptr_s2->School::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_s1->print() (указывает на School):" << endl;
    ptr_s1->print();

    cout << "\nВызов ptr_s2->print() (указывает на SpecialSchool):" << endl;
    ptr_s2->print();

    return 0;
}

```

---

## 1. Базовый Класс `School`

```cpp
class School {{
protected:
    string name;
    int students;
```
- Два поля, оба `protected`:
  - `name` — название школы (тип `string`).
  - `students` — число обучаемых (тип `int`).
- **`protected`** гарантирует, что извне (`main`) к полям нет доступа, но наследник `SpecialSchool` может их использовать.

```cpp
public:
    School(string n, int s) : name(n), students(s) {{}}
```
- Конструктор с **списком инициализации**. `name(n)` вызывает конструктор копирования `string`.

```cpp
    virtual void print() const {{
        cout << "Школа:" << endl;
        cout << "  Название: " << name << endl;
        cout << "  Число учеников: " << students << endl;
    }}
```
- Виртуальный метод печати. `virtual` позволяет специализированной школе переопределить вывод.

```cpp
    virtual ~School() {{}}
```
- Виртуальный деструктор — обязателен для базовых классов.

---

## 2. Производный Класс `SpecialSchool`

```cpp
class SpecialSchool : public School {{
private:
    string specialization;
```
- Наследует `name` и `students` и добавляет `specialization` — название специализации.

```cpp
    SpecialSchool(string n, int s, string spec) : School(n, s), specialization(spec) {{}}
```
- Конструктор **вызывает** `School(n, s)` для инициализации базовой части, затем инициализирует специализацию.

```cpp
    void print() const override {{
        School::print();
        cout << "  Тип: Специализированная школа" << endl;
        cout << "  Специализация: " << specialization << endl;
    }}
```
- **Ключевой момент:** сначала `School::print()` выводит общую информацию (название, число учеников), затем добавляется тип и специализация.
- **`override`** проверяет, что мы корректно переопределяем виртуальный метод.

---

## 3. Полиморфизм в `main`

```cpp
    School sch("Школа №1", 500);
    SpecialSchool ssch("Лицей №2", 300, "Математика и Информатика");
```
- Создаются обычная школа и специализированный лицей.

```cpp
    School* ptr_s2 = &ssch;
```
- Указатель `School*` указывает на `SpecialSchool`. Специализированная школа — это «расширенная школа».

### Статическое связывание
```cpp
    ptr_s2->School::print();
```
- Явная квалификация `School::` вызывает базовый метод: название и число учеников, **без** специализации.

### Динамическое связывание
```cpp
    ptr_s2->print();
```
- Без квалификации программа через **vtable** вызывает `SpecialSchool::print()`. Выводится полная информация, включая специализацию.
