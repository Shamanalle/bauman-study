# Разбор кода: Лабораторная работа 1 (Вариант 14)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным теоретическим объяснением каждого из них.

## Полный исходный код программы
```cpp
#include <iostream>
#include <vector>
#include <string>
#include <cmath>

using namespace std;

class RealNumber {
private:
    double value;
    string repr;

public:
    RealNumber(double v, string r) {
        value = v;
        repr = r;
    }

    int intPartDigits() const {
        string s = repr;
        size_t dotPos = s.find('.');
        if (dotPos == string::npos) return s.length();
        string intPart = s.substr(0, dotPos);
        if (intPart[0] == '-') intPart = intPart.substr(1);
        return intPart.length();
    }

    double getValue() const { return value; }
    string getRepr() const { return repr; }

    void print() const {
        cout << "Число: " << repr
             << " (значение: " << value
             << ", цифр в целой части: " << intPartDigits() << ")" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<RealNumber> numbers = {
        RealNumber(123.456, "123.456"),
        RealNumber(7.89, "7.89"),
        RealNumber(1000.1, "1000.1"),
        RealNumber(0.55, "0.55"),
        RealNumber(42.0, "42.0")
    };

    cout << "Все числа:" << endl;
    for (const auto& n : numbers) {
        n.print();
    }

    double totalSum = 0;
    int totalDigits = 0;
    for (const auto& n : numbers) {
        totalSum += n.getValue();
        totalDigits += n.intPartDigits();
    }

    cout << "\nСумма чисел: " << totalSum << endl;
    cout << "Суммарное количество цифр в целых частях: " << totalDigits << endl;

    return 0;
}

```

---

## 1. Класс `RealNumber`

```cpp
class RealNumber {
private:
    ...
```
- Ключевое слово **`class`** объявляет новый тип данных.
- Блок **`private:`** означает, что поля закрыты от прямого доступа извне (из функции `main`). Это принцип **инкапсуляции**. Мы не можем в `main` написать: `obj.field = 5;`.

```cpp
public:
    RealNumber(...) {
        ...
    }
```
- Блок **`public:`** содержит методы, доступные всем.
- Метод `RealNumber(...)` без типа возвращаемого значения и с именем, совпадающим с именем класса, называется **конструктором**. Он вызывается автоматически при создании объекта. Его задача — проинициализировать приватные переменные переданными значениями.

### Методы класса
- **Геттеры** (`get...()`): так как поля `private`, для чтения их значений снаружи пишутся специальные функции-читатели.
- **`print()`**: выводит все параметры объекта в консоль.
- Ключевое слово **`const`** в конце метода означает, что он **не изменяет** внутреннее состояние (поля) объекта, а только читает их.

## 2. Главная функция `main`

```cpp
    setlocale(LC_ALL, "Russian");
```
- Устанавливает кодовую страницу для консоли Windows, чтобы кириллица выводилась без "кракозябр".

```cpp
    vector<RealNumber> items = { ... };
```
- Создаётся контейнер `vector` с объектами класса `RealNumber`. В C++ вместо обычных массивов принято использовать `vector`, так как он автоматически управляет памятью и может менять свой размер.

```cpp
    for (const auto& item : items) {
        item.print();
    }
```
- Это *Range-based for loop* (цикл по диапазону). Он автоматически проходит по всем элементам вектора.
- `const auto& item` означает, что мы берём каждый объект по **константной ссылке**. Это предотвращает лишнее копирование данных в памяти и защищает объект от случайных изменений.

### Логика задания
Напечатать все числа, сумму и суммарное количество цифр в целых частях.
Для выполнения индивидуального задания мы проходим по контейнеру и используем публичные методы класса для проверки условий и вычисления результатов.
