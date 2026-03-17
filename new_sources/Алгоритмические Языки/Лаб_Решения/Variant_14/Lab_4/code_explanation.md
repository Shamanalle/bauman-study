# Разбор кода: Лабораторная работа 4 (Вариант 14)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением реализации класса `Book` и использования алгоритмов STL.

## Полный исходный код программы
```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <deque>
#include <list>

using namespace std;

class Book {
private:
    string author;
    string title;
    string publisher;
    int year;
    int pages;

public:
    Book() : author(""), title(""), publisher(""), year(0), pages(0) {}

    Book(string a, string t, string p, int y, int pg)
        : author(move(a)), title(move(t)), publisher(move(p)), year(y), pages(pg) {}

    Book(const Book& other)
        : author(other.author), title(other.title), publisher(other.publisher),
          year(other.year), pages(other.pages) {}

    Book(Book&& other) noexcept
        : author(move(other.author)), title(move(other.title)),
          publisher(move(other.publisher)), year(other.year), pages(other.pages) {}

    Book& operator=(const Book& other) {
        if (this != &other) {
            author = other.author;
            title = other.title;
            publisher = other.publisher;
            year = other.year;
            pages = other.pages;
        }
        return *this;
    }

    Book& operator=(Book&& other) noexcept {
        if (this != &other) {
            author = move(other.author);
            title = move(other.title);
            publisher = move(other.publisher);
            year = other.year;
            pages = other.pages;
        }
        return *this;
    }

    string getAuthor() const { return author; }
    string getTitle() const { return title; }

    friend ostream& operator<<(ostream& os, const Book& b) {
        os << "Книга: '" << b.title << "' автор: " << b.author
           << ", Изд-во: " << b.publisher << ", " << b.year
           << " г., " << b.pages << " стр.";
        return os;
    }

    friend istream& operator>>(istream& is, Book& b) {
        is >> b.author >> b.title >> b.publisher >> b.year >> b.pages;
        return is;
    }
};

bool compareByAuthor(const Book& a, const Book& b) {
    return a.getAuthor() < b.getAuthor();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    deque<Book> items;
    Book temp;

    while (fin >> temp) {
        items.push_back(temp);
    }
    fin.close();

    ofstream fout("output.txt");

    fout << "Исходный контейнер (deque):\n";
    cout << "Исходный контейнер (deque):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    sort(items.begin(), items.end(), compareByAuthor);

    fout << "\nОтсортированный контейнер (по ФИО автора):\n";
    cout << "\nОтсортированный контейнер (по ФИО автора):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    list<Book> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());

    fout << "\nСкопированный контейнер (list):\n";
    cout << "\nСкопированный контейнер (list):\n";
    for (const auto& item : copied) {
        fout << item << "\n";
        cout << item << "\n";
    }

    fout.close();
    cout << "\nУспех! Результаты сохранены в файл output.txt" << endl;

    return 0;
}

```

---

## 1. Класс `Book`

### Поля класса
```cpp
private:
    string author;
    string title;
    string publisher;
    int year;
    int pages;
```
Поля класса объявлены как `private` — это стандартная инкапсуляция. Доступ к ним осуществляется через геттеры для чтения и оператор `>>` для записи.

### Конструкторы
```cpp
    Book() : author(""), title(""), publisher(""), year(0), pages(0) {}
```
**Конструктор по умолчанию** необходим для работы с STL-контейнерами. Когда мы пишем `list<Book> copied(items.size())`, контейнер создает `items.size()` объектов, вызывая для каждого конструктор по умолчанию.

```cpp
    Book(string a, string t, string p, int y, int pg)
        : author(move(a)), title(move(t)), publisher(move(p)), year(y), pages(pg) {}
```
**Конструктор с параметрами** инициализирует поля. Заметим `move()` для строковых полей. Поскольку строки (`string`) — это ресурсоемкие объекты, которые выделяют память динамически внутри себя, вместо того чтобы целиком копировать строку, мы **перемещаем** байты прямо в поле с помощью `move()`, что намного быстрее.

### Конструктор копирования и перемещения
```cpp
    Book(const Book& other)
        : author(other.author), title(other.title), publisher(other.publisher),
          year(other.year), pages(other.pages) {}
```
**Конструктор копирования** создаёт полную копию объекта. Все поля копируются из `other`.

```cpp
    Book(Book&& other) noexcept
        : author(move(other.author)), title(move(other.title)),
          publisher(move(other.publisher)), year(other.year), pages(other.pages) {}
```
**Конструктор перемещения** оптимизирует передачу объектов в памяти (например, при вызове `push_back` и расширении массива под капотом вектора). `noexcept` указывает, что этот метод никогда не выбросит исключение — тогда STL-контейнеры будут использовать его вместо медленного конструктора копирования.

### Операторы присваивания
```cpp
    Book& operator=(const Book& other) {
        if (this != &other) {
            author = other.author;
            title = other.title;
            publisher = other.publisher;
            year = other.year;
            pages = other.pages;
        }
        return *this;
    }
```
**Оператор копирующего присваивания**. Проверка `if (this != &other)` предотвращает саморазрушение при `a = a`.

```cpp
    Book& operator=(Book&& other) noexcept { ... }
```
**Оператор перемещающего присваивания**. Аналогичен конструктору перемещения, но для уже существующих объектов. Используется алгоритмом `std::copy` при перезаписи элементов целевого контейнера.

### Операторы потокового ввода/вывода
```cpp
    friend istream& operator>>(istream& is, Book& b) {
        is >> b.author >> b.title >> b.publisher >> b.year >> b.pages;
        return is;
    }
```
Мы переопределяем оператор `>>`. Теперь мы можем просто писать `fin >> temp` и программа сама считает все поля из текстового файла, разбив их по пробелу. Оператор объявлен как **`friend`**, чтобы иметь доступ к `private` полям класса.

---

## 2. Логика функции `main`

### Чтение из файла
```cpp
    deque<Book> items;
    Book temp;
    while (fin >> temp) {
        items.push_back(temp);
    }
```
Мы создаем контейнер `deque`. В цикле `while` считываем по одному объекту из файла до тех пор, пока не достигнем его конца. Метод `push_back` вставляет элемент в конец контейнера, при необходимости самостоятельно увеличивая размер.

### Сортировка (Алгоритм `std::sort`)
```cpp
sort(items.begin(), items.end(), compareByAuthor);
```
Стандартная библиотека `<algorithm>` позволяет очень быстро отсортировать контейнер. Для этого мы передаем `begin()` (итератор на начало), `end()` (знак "за концом" контейнера) и свою функцию-компаратор, которая объясняет процедуре, какое именно значение нужно считать "меньшим" (сравниваем по ФИО автора).

### Копирование (Алгоритм `std::copy`)
```cpp
    list<Book> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());
```
По заданию мы копируем данные из `deque` в `list`.
1. Мы обязаны **выделить память** в целевом контейнере `copied` через конструктор `(items.size())`, потому что `std::copy` только перезаписывает уже выделенные ячейки (не выделяет новую память).
2. `std::copy` берёт элементы от `begin()` до `end()` исходного контейнера и последовательно присваивает (использует `operator=`) в целевой.
