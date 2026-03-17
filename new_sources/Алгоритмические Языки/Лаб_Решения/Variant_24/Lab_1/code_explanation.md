# Разбор кода: Лабораторная работа 1 (Вариант 24)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления.
В последующих разделах этот код разбит на логические блоки с детальным теоретическим объяснением каждого из них.

## Полный исходный код программы
```cpp
#include <iostream>
#include <vector>
#include <string>

using namespace std;

class LibraryBook {
private:
    string author;
    string title;
    int copies;
    int readers;

public:
    LibraryBook(string a, string t, int c, int r) {
        author = a;
        title = t;
        copies = c;
        readers = r;
    }

    double getAvgQueue() const {
        return (copies > 0) ? (double)readers / copies : 0;
    }

    string getAuthor() const { return author; }
    string getTitle() const { return title; }
    int getReaders() const { return readers; }

    void print() const {
        cout << "Автор: " << author
             << ", Название: " << title
             << ", Экземпляров: " << copies
             << ", Читателей: " << readers
             << ", Ср. очередь: " << getAvgQueue() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<LibraryBook> books = {
        LibraryBook("Толстой Л.Н.", "Война и мир", 5, 20),
        LibraryBook("Достоевский Ф.М.", "Идиот", 3, 18),
        LibraryBook("Булгаков М.А.", "Мастер и Маргарита", 10, 50),
        LibraryBook("Тургенев И.С.", "Отцы и дети", 7, 12),
        LibraryBook("Чехов А.П.", "Вишнёвый сад", 4, 8)
    };

    cout << "Все книги:" << endl;
    for (const auto& b : books) {
        b.print();
    }

    int maxReaders = 0;
    int maxIdx = 0;
    for (int i = 0; i < books.size(); ++i) {
        if (books[i].getReaders() > maxReaders) {
            maxReaders = books[i].getReaders();
            maxIdx = i;
        }
    }

    cout << "\nНаиболее читаемая книга:" << endl;
    books[maxIdx].print();

    return 0;
}

```

---

## 1. Класс `LibraryBook`

```cpp
class LibraryBook {
private:
    ...
```
- Ключевое слово **`class`** объявляет новый тип данных.
- Блок **`private:`** означает, что поля закрыты от прямого доступа извне (из функции `main`). Это принцип **инкапсуляции**. Мы не можем в `main` написать: `obj.field = 5;`.

```cpp
public:
    LibraryBook(...) {
        ...
    }
```
- Блок **`public:`** содержит методы, доступные всем.
- Метод `LibraryBook(...)` без типа возвращаемого значения и с именем, совпадающим с именем класса, называется **конструктором**. Он вызывается автоматически при создании объекта. Его задача — проинициализировать приватные переменные переданными значениями.

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
    vector<LibraryBook> items = { ... };
```
- Создаётся контейнер `vector` с объектами класса `LibraryBook`. В C++ вместо обычных массивов принято использовать `vector`, так как он автоматически управляет памятью и может менять свой размер.

```cpp
    for (const auto& item : items) {
        item.print();
    }
```
- Это *Range-based for loop* (цикл по диапазону). Он автоматически проходит по всем элементам вектора.
- `const auto& item` означает, что мы берём каждый объект по **константной ссылке**. Это предотвращает лишнее копирование данных в памяти и защищает объект от случайных изменений.

### Логика задания
Напечатать параметры книг и наиболее читаемую книгу.
Для выполнения индивидуального задания мы проходим по контейнеру и используем публичные методы класса для проверки условий и вычисления результатов.
