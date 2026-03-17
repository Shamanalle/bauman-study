# Разбор кода: Лабораторная работа 4 (Вариант 30)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением реализации класса `Student` и использования алгоритмов STL.

## Полный исходный код программы
```cpp
#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <deque>
#include <list>

using namespace std;

class Student {
private:
    string name;
    string group;
    string recordBook;
    int grades[4];

public:
    Student() : name(""), group(""), recordBook("") { for(int i=0;i<4;i++) grades[i]=0; }

    Student(string n, string g, string rb, int g1, int g2, int g3, int g4)
        : name(move(n)), group(move(g)), recordBook(move(rb)) {
        grades[0]=g1; grades[1]=g2; grades[2]=g3; grades[3]=g4;
    }

    Student(const Student& other)
        : name(other.name), group(other.group), recordBook(other.recordBook) {
        for(int i=0;i<4;i++) grades[i]=other.grades[i];
     {}

    Student(Student&& other) noexcept
        : name(move(other.name)), group(move(other.group)),
          recordBook(move(other.recordBook)) {
        for(int i=0;i<4;i++) grades[i]=other.grades[i];
     {}

    Student& operator=(const Student& other) {
        if (this != &other) {
            name = other.name;
            group = other.group;
            recordBook = other.recordBook;
            for(int i=0;i<4;i++) grades[i]=other.grades[i];
        }
        return *this;
    }

    Student& operator=(Student&& other) noexcept {
        if (this != &other) {
            name = move(other.name);
            group = move(other.group);
            recordBook = move(other.recordBook);
            for(int i=0;i<4;i++) grades[i]=other.grades[i];
        }
        return *this;
    }

    string getName() const { return name; }
    double getAvgGrade() const {
        return (grades[0]+grades[1]+grades[2]+grades[3]) / 4.0;
    }

    friend ostream& operator<<(ostream& os, const Student& s) {
        os << "Студент: " << s.name << ", Группа: " << s.group
           << ", Зачётка: " << s.recordBook << ", Оценки: "
           << s.grades[0] << " " << s.grades[1] << " "
           << s.grades[2] << " " << s.grades[3]
           << ", Средний: " << s.getAvgGrade();
        return os;
    }

    friend istream& operator>>(istream& is, Student& s) {
        is >> s.name >> s.group >> s.recordBook
           >> s.grades[0] >> s.grades[1] >> s.grades[2] >> s.grades[3];
        return is;
    }
};

bool compareByName(const Student& a, const Student& b) {
    return a.getName() < b.getName();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    deque<Student> items;
    Student temp;

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

    sort(items.begin(), items.end(), compareByName);

    fout << "\nОтсортированный контейнер (по ФИО):\n";
    cout << "\nОтсортированный контейнер (по ФИО):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    list<Student> copied(items.size());
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

## 1. Класс `Student`

### Поля класса
```cpp
private:
    string name;
    string group;
    string recordBook;
    int grades[4];
```
Поля класса объявлены как `private` — это стандартная инкапсуляция. Доступ к ним осуществляется через геттеры для чтения и оператор `>>` для записи.

### Конструкторы
```cpp
    Student() : name(""), group(""), recordBook("") { for(int i=0;i<4;i++) grades[i]=0; }
```
**Конструктор по умолчанию** необходим для работы с STL-контейнерами. Когда мы пишем `list<Student> copied(items.size())`, контейнер создает `items.size()` объектов, вызывая для каждого конструктор по умолчанию.

```cpp
    Student(string n, string g, string rb, int g1, int g2, int g3, int g4)
        : name(move(n)), group(move(g)), recordBook(move(rb)) {
        grades[0]=g1; grades[1]=g2; grades[2]=g3; grades[3]=g4;
    }
```
**Конструктор с параметрами** инициализирует поля. Заметим `move()` для строковых полей. Поскольку строки (`string`) — это ресурсоемкие объекты, которые выделяют память динамически внутри себя, вместо того чтобы целиком копировать строку, мы **перемещаем** байты прямо в поле с помощью `move()`, что намного быстрее.

### Конструктор копирования и перемещения
```cpp
    Student(const Student& other)
        : name(other.name), group(other.group), recordBook(other.recordBook) {
        for(int i=0;i<4;i++) grades[i]=other.grades[i];
     {}
```
**Конструктор копирования** создаёт полную копию объекта. Все поля копируются из `other`.

```cpp
    Student(Student&& other) noexcept
        : name(move(other.name)), group(move(other.group)),
          recordBook(move(other.recordBook)) {
        for(int i=0;i<4;i++) grades[i]=other.grades[i];
     {}
```
**Конструктор перемещения** оптимизирует передачу объектов в памяти (например, при вызове `push_back` и расширении массива под капотом вектора). `noexcept` указывает, что этот метод никогда не выбросит исключение — тогда STL-контейнеры будут использовать его вместо медленного конструктора копирования.

### Операторы присваивания
```cpp
    Student& operator=(const Student& other) {
        if (this != &other) {
            name = other.name;
            group = other.group;
            recordBook = other.recordBook;
            for(int i=0;i<4;i++) grades[i]=other.grades[i];
        }
        return *this;
    }
```
**Оператор копирующего присваивания**. Проверка `if (this != &other)` предотвращает саморазрушение при `a = a`.

```cpp
    Student& operator=(Student&& other) noexcept { ... }
```
**Оператор перемещающего присваивания**. Аналогичен конструктору перемещения, но для уже существующих объектов. Используется алгоритмом `std::copy` при перезаписи элементов целевого контейнера.

### Операторы потокового ввода/вывода
```cpp
    friend istream& operator>>(istream& is, Student& s) {
        is >> s.name >> s.group >> s.recordBook
           >> s.grades[0] >> s.grades[1] >> s.grades[2] >> s.grades[3];
        return is;
    }
```
Мы переопределяем оператор `>>`. Теперь мы можем просто писать `fin >> temp` и программа сама считает все поля из текстового файла, разбив их по пробелу. Оператор объявлен как **`friend`**, чтобы иметь доступ к `private` полям класса.

---

## 2. Логика функции `main`

### Чтение из файла
```cpp
    deque<Student> items;
    Student temp;
    while (fin >> temp) {
        items.push_back(temp);
    }
```
Мы создаем контейнер `deque`. В цикле `while` считываем по одному объекту из файла до тех пор, пока не достигнем его конца. Метод `push_back` вставляет элемент в конец контейнера, при необходимости самостоятельно увеличивая размер.

### Сортировка (Алгоритм `std::sort`)
```cpp
sort(items.begin(), items.end(), compareByName);
```
Стандартная библиотека `<algorithm>` позволяет очень быстро отсортировать контейнер. Для этого мы передаем `begin()` (итератор на начало), `end()` (знак "за концом" контейнера) и свою функцию-компаратор, которая объясняет процедуре, какое именно значение нужно считать "меньшим" (сравниваем по ФИО).

### Копирование (Алгоритм `std::copy`)
```cpp
    list<Student> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());
```
По заданию мы копируем данные из `deque` в `list`.
1. Мы обязаны **выделить память** в целевом контейнере `copied` через конструктор `(items.size())`, потому что `std::copy` только перезаписывает уже выделенные ячейки (не выделяет новую память).
2. `std::copy` берёт элементы от `begin()` до `end()` исходного контейнера и последовательно присваивает (использует `operator=`) в целевой.
