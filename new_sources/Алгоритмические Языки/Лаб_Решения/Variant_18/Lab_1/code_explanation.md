# Разбор кода: Лабораторная работа 1 (Вариант 18)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным теоретическим объяснением каждого из них.

## Полный исходный код программы
```cpp
#include <iostream>
#include <vector>
#include <string>

using namespace std;

class ProductMarkup {
private:
    string name;
    int quantity;
    double purchasePrice;

public:
    ProductMarkup(string n, int q, double pp) {
        name = n;
        quantity = q;
        purchasePrice = pp;
    }

    double getRetailCost(double profitPercent) const {
        return quantity * purchasePrice * (1.0 + profitPercent / 100.0);
    }

    string getName() const { return name; }
    int getQuantity() const { return quantity; }
    double getPurchasePrice() const { return purchasePrice; }

    void print() const {
        cout << "Товар: " << name
             << ", Кол-во: " << quantity
             << ", Закупочная цена: " << purchasePrice << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<ProductMarkup> products = {
        ProductMarkup("Молоко", 50, 55.00),
        ProductMarkup("Хлеб", 100, 28.00),
        ProductMarkup("Масло", 30, 75.00),
        ProductMarkup("Сыр", 25, 220.00),
        ProductMarkup("Яйца", 80, 65.00)
    };

    cout << "Все товары:" << endl;
    for (const auto& p : products) {
        p.print();
    }

    double profitPercent;
    cout << "\nВведите процент прибыли: ";
    cin >> profitPercent;

    double totalCost = 0;
    cout << "\nСтоимость товаров с наценкой " << profitPercent << "%:" << endl;
    for (const auto& p : products) {
        double cost = p.getRetailCost(profitPercent);
        cout << p.getName() << ": " << cost << endl;
        totalCost += cost;
    }
    cout << "\nСуммарная стоимость: " << totalCost << endl;

    return 0;
}

```

---

## 1. Класс `ProductMarkup`

```cpp
class ProductMarkup {
private:
    ...
```
- Ключевое слово **`class`** объявляет новый тип данных.
- Блок **`private:`** означает, что поля закрыты от прямого доступа извне (из функции `main`). Это принцип **инкапсуляции**. Мы не можем в `main` написать: `obj.field = 5;`.

```cpp
public:
    ProductMarkup(...) {
        ...
    }
```
- Блок **`public:`** содержит методы, доступные всем.
- Метод `ProductMarkup(...)` без типа возвращаемого значения и с именем, совпадающим с именем класса, называется **конструктором**. Он вызывается автоматически при создании объекта. Его задача — проинициализировать приватные переменные переданными значениями.

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
    vector<ProductMarkup> items = { ... };
```
- Создаётся контейнер `vector` с объектами класса `ProductMarkup`. В C++ вместо обычных массивов принято использовать `vector`, так как он автоматически управляет памятью и может менять свой размер.

```cpp
    for (const auto& item : items) {
        item.print();
    }
```
- Это *Range-based for loop* (цикл по диапазону). Он автоматически проходит по всем элементам вектора.
- `const auto& item` означает, что мы берём каждый объект по **константной ссылке**. Это предотвращает лишнее копирование данных в памяти и защищает объект от случайных изменений.

### Логика задания
Напечатать параметры товаров и суммарную стоимость с наценкой (процент вводится с клавиатуры).
Для выполнения индивидуального задания мы проходим по контейнеру и используем публичные методы класса для проверки условий и вычисления результатов.
