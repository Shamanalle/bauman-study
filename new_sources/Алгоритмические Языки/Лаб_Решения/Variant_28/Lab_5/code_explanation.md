# Разбор кода: Лабораторная работа 5 (Вариант 28)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением механизмов использования ассоциативных контейнеров.

## Полный исходный код программы
```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <set>
#include <unordered_set>

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

    const string& getAuthor() const { return author; }
    const string& getTitle() const { return title; }
    const string& getPublisher() const { return publisher; }
    int getYear() const { return year; }
    int getPages() const { return pages; }

    bool operator<(const Book& other) const {
        if (author != other.author) return author < other.author;
        return title < other.title;
    }

    bool operator==(const Book& other) const {
        return (author == other.author &&
                title == other.title &&
                publisher == other.publisher &&
                year == other.year &&
                pages == other.pages);
    }

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

namespace std {
    template<>
    struct hash<Book> {
        size_t operator()(const Book& obj) const {
            size_t h1 = hash<string>()(obj.getAuthor());
            size_t h2 = hash<string>()(obj.getTitle());
            return h1 ^ (h2 << 1);
        }
    };
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    set<Book> orderedSet;
    unordered_set<Book> hashSet;
    
    Book tempObj;

    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
    fin.close();

    cout << "Дерево set (Сортировка по ФИО автора):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }

    cout << "\nХэш-таблица unordered_set (Без порядка):\n";
    for (const auto& item : hashSet) {
        cout << item << endl;
    }

    return 0;
}

```

---

## 1. Как работает `set`

```cpp
    bool operator<(const Book& other) const {
        if (author != other.author) return author < other.author;
        return title < other.title;
    }
```
Контейнер `set` постоянно сортирует элементы "на лету", расставляя их по веткам бинарного дерева поиска (Red-Black Tree). Для этого ему нужна **только** одна операция: проверка на `<` (меньше).

Особенность работы дерева: оно считает два объекта **абсолютно одинаковыми** (и удаляет дубликат), если `A не меньше B, и B не меньше A`. 
Если бы мы проверяли **только** поле `author`:
- Два объекта с одинаковым значением `author` считались бы эквивалентными.
- `!(author_a < author_b)` и `!(author_b < author_a)` — оба ложные, значит дерево решит, что это **одна и та же** запись и выбросит вторую.

Мы избегаем этого, добавляя дополнительный критерий `title` в случае равных значений основного поля (составное/каскадное условие сортировки).

---

## 2. Как работает `unordered_set`

### Оператор равенства `==`
```cpp
    bool operator==(const Book& other) const {
        return (author == other.author &&
                title == other.title &&
                publisher == other.publisher &&
                year == other.year &&
                pages == other.pages);
    }
```
Хэш-контейнеры не используют сортировку. Они кладут объект в "ящик" (bucket). Чтобы проверить два объекта на совпадение в этом "ящике" (при коллизии хэшей), им нужен явный **оператор равенства** `==`. Мы сравниваем **все** поля объекта на точное совпадение.

### Специализация `std::hash`
```cpp
namespace std {
    template<>
    struct hash<Book> {
        size_t operator()(const Book& obj) const {
            size_t h1 = hash<string>()(obj.getAuthor());
            size_t h2 = hash<string>()(obj.getTitle());
            return h1 ^ (h2 << 1);
        }
    };
}
```
Чтобы определить, **в какой именно ящик** (bucket) положить объект, нужна хэш-функция.
Мы "передаём" компилятору кусок кода для `std::hash`. Алгоритм:
1. Вычисляется хэш первого поля через стандартный `hash<string>()` или `hash<double>()`.
2. Вычисляется хэш второго ключевого поля.
3. Хэши смешиваются с помощью оператора `^` (Исключающее ИЛИ / XOR) и `<<` (побитовый сдвиг влево), получая одно уникальное число `size_t`. Сдвиг нужен для того, чтобы комбинация была ассиметричной: `hash(a, b) != hash(b, a)`.

---

## 3. Вставка и использование

```cpp
    set<Book> orderedSet;
    unordered_set<Book> hashSet;
    
    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
```
В отличие от массива (`vector`), где мы писали `push_back(tempObj)` (засунуть в конец), деревья и таблицы не имеют "конца" в классическом понимании. Для них существует метод `insert()`. 
- Для `set`: метод `insert()` сам вычисляет правильное место в красно-чёрном дереве, используя наш `operator<`. Элементы автоматически оказываются отсортированными.
- Для `unordered_set`: метод `insert()` вычисляет хэш объекта (через `std::hash`), определяет номер bucket-а и помещает элемент туда. Если bucket уже занят (коллизия), используется `operator==` для проверки на дубликат.

### Вывод
```cpp
    cout << "Дерево set (Сортировка по ФИО автора):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }
```
Обход дерева `set` через range-based `for` гарантированно выдаёт элементы в **отсортированном порядке** (по ФИО автора).
Обход `unordered_set` выдаёт элементы в **произвольном порядке**, зависящем от значений хэшей.
