# Разбор кода: Лабораторная работа 1 (Вариант 32)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным теоретическим объяснением каждого из них.

## Полный исходный код программы
```cpp
#include <iostream>
#include <vector>
#include <string>

using namespace std;

class CryptoMethod {
private:
    string name;
    string type;

public:
    CryptoMethod(string n, string t) {
        name = n;
        type = t;
    }

    string getName() const { return name; }
    string getType() const { return type; }

    void print() const {
        cout << "Метод: " << name << ", Тип: " << type << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<CryptoMethod> methods = {
        CryptoMethod("AES-256", "symmetric"),
        CryptoMethod("RSA", "asymmetric"),
        CryptoMethod("DES", "symmetric"),
        CryptoMethod("ECC", "asymmetric"),
        CryptoMethod("Blowfish", "symmetric")
    };

    cout << "Все криптографические методы:" << endl;
    for (const auto& m : methods) {
        m.print();
    }

    string reqType;
    cout << "\nВведите тип (symmetric/asymmetric): ";
    cin >> reqType;

    cout << "\nМетоды типа '" << reqType << "':" << endl;
    bool found = false;
    for (const auto& m : methods) {
        if (m.getType() == reqType) {
            m.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Методов данного типа не найдено." << endl;
    }

    return 0;
}

```

---

## 1. Класс `CryptoMethod`

```cpp
class CryptoMethod {
private:
    ...
```
- Ключевое слово **`class`** объявляет новый тип данных.
- Блок **`private:`** означает, что поля закрыты от прямого доступа извне (из функции `main`). Это принцип **инкапсуляции**. Мы не можем в `main` написать: `obj.field = 5;`.

```cpp
public:
    CryptoMethod(...) {
        ...
    }
```
- Блок **`public:`** содержит методы, доступные всем.
- Метод `CryptoMethod(...)` без типа возвращаемого значения и с именем, совпадающим с именем класса, называется **конструктором**. Он вызывается автоматически при создании объекта. Его задача — проинициализировать приватные переменные переданными значениями.

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
    vector<CryptoMethod> items = { ... };
```
- Создаётся контейнер `vector` с объектами класса `CryptoMethod`. В C++ вместо обычных массивов принято использовать `vector`, так как он автоматически управляет памятью и может менять свой размер.

```cpp
    for (const auto& item : items) {
        item.print();
    }
```
- Это *Range-based for loop* (цикл по диапазону). Он автоматически проходит по всем элементам вектора.
- `const auto& item` означает, что мы берём каждый объект по **константной ссылке**. Это предотвращает лишнее копирование данных в памяти и защищает объект от случайных изменений.

### Логика задания
Вывести все методы заданного типа (тип вводится с клавиатуры).
Для выполнения индивидуального задания мы проходим по контейнеру и используем публичные методы класса для проверки условий и вычисления результатов.
