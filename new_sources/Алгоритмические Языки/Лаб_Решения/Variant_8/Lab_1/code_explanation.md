# Разбор кода: Лабораторная работа 1 (Вариант 8)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным теоретическим объяснением каждого из них.

## Полный исходный код программы
```cpp
#include <iostream>
#include <vector>
#include <cmath>

using namespace std;

class QuadEquation {
private:
    double a, b, c;

public:
    QuadEquation(double pa, double pb, double pc) {
        a = pa;
        b = pb;
        c = pc;
    }

    double getDiscriminant() const {
        return b * b - 4 * a * c;
    }

    bool hasRealRoots() const {
        return getDiscriminant() >= 0;
    }

    double getA() const { return a; }
    double getB() const { return b; }
    double getC() const { return c; }

    void print() const {
        cout << a << "x^2 + " << b << "x + " << c << " = 0"
             << ", D = " << getDiscriminant()
             << (hasRealRoots() ? " (есть корни)" : " (нет корней)") << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<QuadEquation> equations = {
        QuadEquation(1, -3, 2),
        QuadEquation(1, 2, 5),
        QuadEquation(2, -4, 0),
        QuadEquation(1, 0, 1),
        QuadEquation(1, -5, 6)
    };

    cout << "Все уравнения:" << endl;
    for (const auto& eq : equations) {
        eq.print();
    }

    cout << "\nУравнения с вещественными корнями:" << endl;
    bool found = false;
    for (const auto& eq : equations) {
        if (eq.hasRealRoots()) {
            eq.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Таких уравнений не найдено." << endl;
    }

    return 0;
}

```

---

## 1. Класс `QuadEquation`

```cpp
class QuadEquation {
private:
    ...
```
- Ключевое слово **`class`** объявляет новый тип данных.
- Блок **`private:`** означает, что поля закрыты от прямого доступа извне (из функции `main`). Это принцип **инкапсуляции**. Мы не можем в `main` написать: `obj.field = 5;`.

```cpp
public:
    QuadEquation(...) {
        ...
    }
```
- Блок **`public:`** содержит методы, доступные всем.
- Метод `QuadEquation(...)` без типа возвращаемого значения и с именем, совпадающим с именем класса, называется **конструктором**. Он вызывается автоматически при создании объекта. Его задача — проинициализировать приватные переменные переданными значениями.

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
    vector<QuadEquation> items = { ... };
```
- Создаётся контейнер `vector` с объектами класса `QuadEquation`. В C++ вместо обычных массивов принято использовать `vector`, так как он автоматически управляет памятью и может менять свой размер.

```cpp
    for (const auto& item : items) {
        item.print();
    }
```
- Это *Range-based for loop* (цикл по диапазону). Он автоматически проходит по всем элементам вектора.
- `const auto& item` означает, что мы берём каждый объект по **константной ссылке**. Это предотвращает лишнее копирование данных в памяти и защищает объект от случайных изменений.

### Логика задания
Вывести уравнения, имеющие вещественные корни (D ≥ 0).
Для выполнения индивидуального задания мы проходим по контейнеру и используем публичные методы класса для проверки условий и вычисления результатов.
