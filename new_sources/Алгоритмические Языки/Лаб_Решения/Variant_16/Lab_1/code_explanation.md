# Разбор кода: Лабораторная работа 1 (Вариант 16)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным теоретическим объяснением каждого из них.

## Полный исходный код программы
```cpp
#include <iostream>
#include <vector>

using namespace std;

class Expression {
private:
    vector<int> numbers;
    vector<char> operations;

public:
    Expression(vector<int> nums, vector<char> ops) {
        numbers = nums;
        operations = ops;
    }

    double evaluate() const {
        if (numbers.empty()) return 0;
        double result = numbers[0];
        for (int i = 0; i < operations.size(); ++i) {
            switch (operations[i]) {
                case '+': result += numbers[i + 1]; break;
                case '-': result -= numbers[i + 1]; break;
                case '*': result *= numbers[i + 1]; break;
                case '/':
                    if (numbers[i + 1] != 0)
                        result /= numbers[i + 1];
                    break;
            }
        }
        return result;
    }

    void print() const {
        for (int i = 0; i < numbers.size(); ++i) {
            cout << numbers[i];
            if (i < operations.size()) cout << " " << operations[i] << " ";
        }
        cout << " = " << evaluate() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Expression> exprs = {
        Expression({10, 5, 3}, {'+', '*'}),
        Expression({20, 4, 2}, {'-', '+'}),
        Expression({7, 3, 2, 1}, {'+', '-', '*'}),
        Expression({100, 25}, {'/'}),
        Expression({8, 2, 3}, {'*', '-'})
    };

    cout << "Все выражения:" << endl;
    for (const auto& e : exprs) {
        e.print();
    }

    cout << "\nРезультаты в обратном порядке:" << endl;
    for (int i = exprs.size() - 1; i >= 0; --i) {
        exprs[i].print();
    }

    return 0;
}

```

---

## 1. Класс `Expression`

```cpp
class Expression {
private:
    ...
```
- Ключевое слово **`class`** объявляет новый тип данных.
- Блок **`private:`** означает, что поля закрыты от прямого доступа извне (из функции `main`). Это принцип **инкапсуляции**. Мы не можем в `main` написать: `obj.field = 5;`.

```cpp
public:
    Expression(...) {
        ...
    }
```
- Блок **`public:`** содержит методы, доступные всем.
- Метод `Expression(...)` без типа возвращаемого значения и с именем, совпадающим с именем класса, называется **конструктором**. Он вызывается автоматически при создании объекта. Его задача — проинициализировать приватные переменные переданными значениями.

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
    vector<Expression> items = { ... };
```
- Создаётся контейнер `vector` с объектами класса `Expression`. В C++ вместо обычных массивов принято использовать `vector`, так как он автоматически управляет памятью и может менять свой размер.

```cpp
    for (const auto& item : items) {
        item.print();
    }
```
- Это *Range-based for loop* (цикл по диапазону). Он автоматически проходит по всем элементам вектора.
- `const auto& item` означает, что мы берём каждый объект по **константной ссылке**. Это предотвращает лишнее копирование данных в памяти и защищает объект от случайных изменений.

### Логика задания
Ввести несколько выражений и вывести результаты в обратном порядке.
Для выполнения индивидуального задания мы проходим по контейнеру и используем публичные методы класса для проверки условий и вычисления результатов.
