# Разбор кода: Лабораторная работа 1 (Вариант 30)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным теоретическим объяснением каждого из них.

## Полный исходный код программы
```cpp
#include <iostream>
#include <vector>
#include <string>
#include <cmath>

using namespace std;

class BankDeposit {
private:
    string owner;
    double amount;
    double rate;

public:
    BankDeposit(string o, double a, double r) {
        owner = o;
        amount = a;
        rate = r;
    }

    double calcAmount(int years) const {
        return amount * pow(1.0 + rate / 100.0, years);
    }

    string getOwner() const { return owner; }
    double getAmount() const { return amount; }
    double getRate() const { return rate; }

    void print() const {
        cout << "Владелец: " << owner
             << ", Сумма: " << amount
             << ", Ставка: " << rate << "%" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<BankDeposit> deposits = {
        BankDeposit("Иванов И.И.", 100000, 7.5),
        BankDeposit("Петров П.П.", 250000, 5.0),
        BankDeposit("Сидоров С.С.", 50000, 10.0),
        BankDeposit("Козлова А.В.", 180000, 6.5),
        BankDeposit("Морозов Д.Е.", 300000, 4.5)
    };

    cout << "Все вклады:" << endl;
    for (const auto& dep : deposits) {
        dep.print();
    }

    int years;
    cout << "\nВведите количество лет: ";
    cin >> years;

    double totalSum = 0;
    cout << "\nСуммы через " << years << " лет:" << endl;
    for (const auto& dep : deposits) {
        double futureAmount = dep.calcAmount(years);
        cout << dep.getOwner() << ": " << futureAmount << endl;
        totalSum += futureAmount;
    }
    cout << "\nОбщая сумма на всех счетах: " << totalSum << endl;

    return 0;
}

```

---

## 1. Класс `BankDeposit`

```cpp
class BankDeposit {
private:
    ...
```
- Ключевое слово **`class`** объявляет новый тип данных.
- Блок **`private:`** означает, что поля закрыты от прямого доступа извне (из функции `main`). Это принцип **инкапсуляции**. Мы не можем в `main` написать: `obj.field = 5;`.

```cpp
public:
    BankDeposit(...) {
        ...
    }
```
- Блок **`public:`** содержит методы, доступные всем.
- Метод `BankDeposit(...)` без типа возвращаемого значения и с именем, совпадающим с именем класса, называется **конструктором**. Он вызывается автоматически при создании объекта. Его задача — проинициализировать приватные переменные переданными значениями.

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
    vector<BankDeposit> items = { ... };
```
- Создаётся контейнер `vector` с объектами класса `BankDeposit`. В C++ вместо обычных массивов принято использовать `vector`, так как он автоматически управляет памятью и может менять свой размер.

```cpp
    for (const auto& item : items) {
        item.print();
    }
```
- Это *Range-based for loop* (цикл по диапазону). Он автоматически проходит по всем элементам вектора.
- `const auto& item` означает, что мы берём каждый объект по **константной ссылке**. Это предотвращает лишнее копирование данных в памяти и защищает объект от случайных изменений.

### Логика задания
Вывести параметры всех вкладов и суммарную сумму через заданное число лет (вводится с клавиатуры).
Для выполнения индивидуального задания мы проходим по контейнеру и используем публичные методы класса для проверки условий и вычисления результатов.
