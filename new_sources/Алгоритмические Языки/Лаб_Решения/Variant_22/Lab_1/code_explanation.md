# Разбор кода: Лабораторная работа 1 (Вариант 22)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным теоретическим объяснением каждого из них.

## Полный исходный код программы
```cpp
#include <iostream>
#include <vector>

using namespace std;

class ApartmentRooms {
private:
    double totalPrice;
    int rooms;

public:
    ApartmentRooms(double price, int r) {
        totalPrice = price;
        rooms = r;
    }

    double getRoomPrice() const {
        return (rooms > 0) ? totalPrice / rooms : 0;
    }

    double getTotalPrice() const { return totalPrice; }
    int getRooms() const { return rooms; }

    void print() const {
        cout << "Стоимость: " << totalPrice
             << ", Комнат: " << rooms
             << ", Цена за комнату: " << getRoomPrice() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<ApartmentRooms> apartments = {
        ApartmentRooms(5000000, 3),
        ApartmentRooms(3000000, 1),
        ApartmentRooms(8000000, 4),
        ApartmentRooms(4500000, 2),
        ApartmentRooms(12000000, 5)
    };

    cout << "Все квартиры:" << endl;
    for (const auto& apt : apartments) {
        apt.print();
    }

    double maxRoomPrice;
    cout << "\nВведите макс. стоимость одной комнаты: ";
    cin >> maxRoomPrice;

    cout << "\nКвартиры с ценой за комнату <= " << maxRoomPrice << ":" << endl;
    bool found = false;
    for (const auto& apt : apartments) {
        if (apt.getRoomPrice() <= maxRoomPrice) {
            apt.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Таких квартир не найдено." << endl;
    }

    return 0;
}

```

---

## 1. Класс `ApartmentRooms`

```cpp
class ApartmentRooms {
private:
    ...
```
- Ключевое слово **`class`** объявляет новый тип данных.
- Блок **`private:`** означает, что поля закрыты от прямого доступа извне (из функции `main`). Это принцип **инкапсуляции**. Мы не можем в `main` написать: `obj.field = 5;`.

```cpp
public:
    ApartmentRooms(...) {
        ...
    }
```
- Блок **`public:`** содержит методы, доступные всем.
- Метод `ApartmentRooms(...)` без типа возвращаемого значения и с именем, совпадающим с именем класса, называется **конструктором**. Он вызывается автоматически при создании объекта. Его задача — проинициализировать приватные переменные переданными значениями.

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
    vector<ApartmentRooms> items = { ... };
```
- Создаётся контейнер `vector` с объектами класса `ApartmentRooms`. В C++ вместо обычных массивов принято использовать `vector`, так как он автоматически управляет памятью и может менять свой размер.

```cpp
    for (const auto& item : items) {
        item.print();
    }
```
- Это *Range-based for loop* (цикл по диапазону). Он автоматически проходит по всем элементам вектора.
- `const auto& item` означает, что мы берём каждый объект по **константной ссылке**. Это предотвращает лишнее копирование данных в памяти и защищает объект от случайных изменений.

### Логика задания
Напечатать квартиры, стоимость одной комнаты в которых не превышает заданной суммы (вводится с клавиатуры).
Для выполнения индивидуального задания мы проходим по контейнеру и используем публичные методы класса для проверки условий и вычисления результатов.
