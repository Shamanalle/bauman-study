# Разбор кода: Лабораторная работа 3 (Вариант 7)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением конструкций наследования и полиморфизма.

## Полный исходный код программы
```cpp
#include <iostream>
#include <cmath>

using namespace std;

class RealNumber {
protected: 
    double value; 

public:
    RealNumber(double val) : value(val) {}

    virtual double absValue() const {
        return abs(value);
    }

    virtual void print() const {
        cout << "Вещественное число:" << endl;
        cout << "  Значение: " << value << endl;
        cout << "  Модуль: " << absValue() << endl;
    }
    
    virtual ~RealNumber() {}
};

class ComplexNumber : public RealNumber {
private:
    double imaginary; 

public:
    ComplexNumber(double real, double imag) 
        : RealNumber(real), imaginary(imag) {} 

    double absValue() const override {
        return sqrt(value * value + imaginary * imaginary);
    }

    void print() const override {
        cout << "Комплексное число:" << endl;
        cout << "  Действительная часть: " << value << endl;
        cout << "  Мнимая часть: " << imaginary << endl;
        cout << "  Формат: " << value << (imaginary >= 0 ? " + " : " - ") << abs(imaginary) << "i" << endl;
        cout << "  Модуль: " << absValue() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    RealNumber r(-5.5);
    ComplexNumber c(3.0, -4.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    r.print();
    cout << endl;
    c.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    RealNumber* ptr_r1 = &r;
    RealNumber* ptr_r2 = &c;

    cout << "\n[Явный вызов базового метода] ptr_r2->RealNumber::print():" << endl;
    ptr_r2->RealNumber::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_r1->print() (указывает на RealNumber):" << endl;
    ptr_r1->print();

    cout << "\nВызов ptr_r2->print() (указывает на ComplexNumber):" << endl;
    ptr_r2->print();

    return 0;
}

```

---

## 1. Базовый Класс `RealNumber`
```cpp
class RealNumber {{
protected: 
    double value; 
```
Ключевое слово **`protected`** (защищенный). Если бы мы написали `private`, то дочерние классы не смогли бы увидеть поле `value`. `protected` решает эту проблему: из внешнего кода (в функции `main()`) написать `r.value` нельзя, но производный класс им пользоваться может.

```cpp
    RealNumber(double val) : value(val) {{}}
```
Конструктор со **Списком инициализации**. Запись `: value(val)` делает то же самое, что и `value = val;` внутри скобок `{{}}`, но является более правильной и быстрой в C++.

```cpp
    virtual double absValue() const {{
        return abs(value);
    }}
```
- Метод вычисляет модуль (абсолютное значение) вещественного числа с помощью `abs()` из `<cmath>`.
- **`virtual`** — это самое главное слово в теме полиморфизма. Оно указывает компилятору, что если кто-то позже унаследует этот класс, он **может переопределить** (*override*) эту функцию.

```cpp
    virtual void print() const {{
        cout << "Вещественное число:" << endl;
        cout << "  Значение: " << value << endl;
        cout << "  Модуль: " << absValue() << endl;
    }}
```
- Виртуальный метод печати. Внутри вызывается `absValue()` — и поскольку `absValue()` тоже виртуальный, при вызове через указатель будет вызвана правильная версия (`abs(value)` для вещественного или `sqrt(re² + im²)` для комплексного).

```cpp
    virtual ~RealNumber() {{}}
```
- Обязательно наличие **виртуального деструктора**. Если через указатель родительского класса удалить класс-наследник, виртуальный деструктор гарантирует, что удаление начнется с дочерней части, а не только с родительской (предотвращая утечку памяти).

---

## 2. Производный класс `ComplexNumber`
```cpp
class ComplexNumber : public RealNumber {{
```
**`public RealNumber`** — мы "публично наследуемся". Это означает, что методы `print` и `absValue` останутся публичными и в комплексном числе. Комплексное число — это расширенная версия вещественного числа (появляется поле `imaginary`).

```cpp
private:
    double imaginary;
```
- Дополнительное поле `imaginary` — мнимая часть комплексного числа. Объявлено как `private`.

```cpp
    ComplexNumber(double real, double imag) 
        : RealNumber(real), imaginary(imag) {{}} 
```
Конструктор наследника *обязан* "собрать" родительскую часть. Поэтому мы **явно вызываем родительский конструктор** `RealNumber(real)` в списке инициализации. Без этого вызова компилятор попытается вызвать `RealNumber()` без аргументов, которого нет.

```cpp
    double absValue() const override {{
        return sqrt(value * value + imaginary * imaginary);
    }}
```
- Переопределённый метод модуля. Для комплексного числа z = a + bi модуль |z| = √(a² + b²).
- Поле `value` доступно напрямую, т.к. оно `protected` в базовом классе.

```cpp
    void print() const override {{
        cout << "Комплексное число:" << endl;
        cout << "  Действительная часть: " << value << endl;
        cout << "  Мнимая часть: " << imaginary << endl;
        cout << "  Формат: " << value << (imaginary >= 0 ? " + " : " - ") << abs(imaginary) << "i" << endl;
        cout << "  Модуль: " << absValue() << endl;
    }}
```
**`override`** (опциональное, но полезное слово появилось в C++11) сообщает компилятору: "Я хочу переопределить виртуальную функцию родителя. Проверь, чтобы имена и параметры функций точно совпадали".
- Тернарный оператор `(imaginary >= 0 ? " + " : " - ")` выбирает знак перед мнимой частью для правильного отображения форматов вроде `3 + 4i` или `3 - 4i`.

---

## 3. Полиморфизм в `main`

```cpp
    RealNumber r(-5.5);
    ComplexNumber c(3.0, -4.0);
```
- Создаются два объекта: вещественное число -5.5 (модуль 5.5) и комплексное число 3 - 4i (модуль 5.0).

```cpp
    RealNumber* ptr_r2 = &c;
```
Это базовая фишка С++: **указатель базового типа может безопасно указывать на объект любого унаследованного типа**. Для компилятора тип указателя — это `RealNumber*` (родитель). Но в оперативной памяти по этому адресу физически лежит `ComplexNumber` (наследник).

### Статическое связывание
```cpp
    ptr_r2->RealNumber::print(); 
```
Мы заставляем указатель "вызвать именно родительскую функцию" в обход всей динамики. Это статическое связывание (жесткая привязка во время компиляции). Будет выведено «Вещественное число» с модулем `abs(3.0) = 3`, то есть мнимая часть **игнорируется**.

### Динамическое связывание
```cpp
    ptr_r2->print();
```
Поскольку `print()` помечен словом `virtual`, компилятор не привязывает вызов жестко. Во время работы программы она идет по указателю `ptr_r2`, заглядывает внутрь объекта `c`, находит там "Таблицу виртуальных функций" и видит: ага, реальный тип объекта — это Комплексное число! Значит, нужно вызвать функцию `ComplexNumber::print()`. Это и есть динамический полиморфизм.
