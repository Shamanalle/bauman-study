# Разбор кода: Лабораторная работа 1 (Вариант 31)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным теоретическим объяснением каждого из них.

## Полный исходный код программы
```cpp
#include <iostream>
#include <vector>
#include <string>

using namespace std;

class SecurityTool {
private:
    string name;
    int securityClass;

public:
    SecurityTool(string n, int sc) {
        name = n;
        securityClass = sc;
    }

    bool isSuitable(int requiredClass) const {
        return securityClass <= requiredClass;
    }

    string getName() const { return name; }
    int getSecurityClass() const { return securityClass; }

    void print() const {
        cout << "Название: " << name
             << ", Класс защищённости: " << securityClass << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<SecurityTool> tools = {
        SecurityTool("SecureShield Pro", 2),
        SecurityTool("DataGuard", 4),
        SecurityTool("CryptoWall", 1),
        SecurityTool("NetProtect", 5),
        SecurityTool("AccessControl", 3)
    };

    cout << "Все средства защиты:" << endl;
    for (const auto& tool : tools) {
        tool.print();
    }

    int reqClass;
    cout << "\nВведите требуемый класс защищённости (1-7): ";
    cin >> reqClass;

    cout << "\nСредства, подходящие для класса " << reqClass << ":" << endl;
    bool found = false;
    for (const auto& tool : tools) {
        if (tool.isSuitable(reqClass)) {
            tool.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Подходящих средств не найдено." << endl;
    }

    return 0;
}

```

---

## 1. Класс `SecurityTool`

```cpp
class SecurityTool {
private:
    ...
```
- Ключевое слово **`class`** объявляет новый тип данных.
- Блок **`private:`** означает, что поля закрыты от прямого доступа извне (из функции `main`). Это принцип **инкапсуляции**. Мы не можем в `main` написать: `obj.field = 5;`.

```cpp
public:
    SecurityTool(...) {
        ...
    }
```
- Блок **`public:`** содержит методы, доступные всем.
- Метод `SecurityTool(...)` без типа возвращаемого значения и с именем, совпадающим с именем класса, называется **конструктором**. Он вызывается автоматически при создании объекта. Его задача — проинициализировать приватные переменные переданными значениями.

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
    vector<SecurityTool> items = { ... };
```
- Создаётся контейнер `vector` с объектами класса `SecurityTool`. В C++ вместо обычных массивов принято использовать `vector`, так как он автоматически управляет памятью и может менять свой размер.

```cpp
    for (const auto& item : items) {
        item.print();
    }
```
- Это *Range-based for loop* (цикл по диапазону). Он автоматически проходит по всем элементам вектора.
- `const auto& item` означает, что мы берём каждый объект по **константной ссылке**. Это предотвращает лишнее копирование данных в памяти и защищает объект от случайных изменений.

### Логика задания
Вывести СЗ, подходящие для заданного класса защищённости (вводится с клавиатуры).
Для выполнения индивидуального задания мы проходим по контейнеру и используем публичные методы класса для проверки условий и вычисления результатов.
