# Разбор кода: Лабораторная работа 1 (Вариант 12)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным теоретическим объяснением каждого из них.

## Полный исходный код программы
```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class Computer {
private:
    string processor;
    double clockSpeed;

public:
    Computer(string p, double c) {
        processor = p;
        clockSpeed = c;
    }

    string getProcessor() const { return processor; }
    double getClockSpeed() const { return clockSpeed; }

    void print() const {
        cout << "Процессор: " << processor
             << ", Частота: " << clockSpeed << " ГГц" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Computer> computers = {
        Computer("Intel i7-13700K", 5.4),
        Computer("AMD Ryzen 9 7950X", 5.7),
        Computer("Intel i5-12400", 4.4),
        Computer("AMD Ryzen 5 5600X", 4.6),
        Computer("Intel i9-14900K", 6.0)
    };

    cout << "Все компьютеры:" << endl;
    for (const auto& pc : computers) {
        pc.print();
    }

    sort(computers.begin(), computers.end(),
         [](const Computer& a, const Computer& b) {
             return a.getClockSpeed() > b.getClockSpeed();
         });

    cout << "\nКомпьютеры по убыванию частоты:" << endl;
    for (const auto& pc : computers) {
        pc.print();
    }

    return 0;
}

```

---

## 1. Класс `Computer`

```cpp
class Computer {
private:
    ...
```
- Ключевое слово **`class`** объявляет новый тип данных.
- Блок **`private:`** означает, что поля закрыты от прямого доступа извне (из функции `main`). Это принцип **инкапсуляции**. Мы не можем в `main` написать: `obj.field = 5;`.

```cpp
public:
    Computer(...) {
        ...
    }
```
- Блок **`public:`** содержит методы, доступные всем.
- Метод `Computer(...)` без типа возвращаемого значения и с именем, совпадающим с именем класса, называется **конструктором**. Он вызывается автоматически при создании объекта. Его задача — проинициализировать приватные переменные переданными значениями.

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
    vector<Computer> items = { ... };
```
- Создаётся контейнер `vector` с объектами класса `Computer`. В C++ вместо обычных массивов принято использовать `vector`, так как он автоматически управляет памятью и может менять свой размер.

```cpp
    for (const auto& item : items) {
        item.print();
    }
```
- Это *Range-based for loop* (цикл по диапазону). Он автоматически проходит по всем элементам вектора.
- `const auto& item` означает, что мы берём каждый объект по **константной ссылке**. Это предотвращает лишнее копирование данных в памяти и защищает объект от случайных изменений.

### Логика задания
Вывести параметры всех ПК в порядке невозрастания тактовой частоты.
Для выполнения индивидуального задания мы проходим по контейнеру и используем публичные методы класса для проверки условий и вычисления результатов.
