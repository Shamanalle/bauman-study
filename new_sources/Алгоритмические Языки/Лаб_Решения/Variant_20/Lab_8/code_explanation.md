# Разбор кода: Лабораторная работа 8 (Вариант 20)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением того, как устроены пользовательские "умные" указатели.

## Полный исходный код программы
```cpp
#include <iostream>
#include <string>
#include <utility> 

using namespace std;

class TestClass {
private:
    string name;
    int value;
public:
    TestClass(string n, int v) : name(move(n)), value(v) {
        cout << "[TestClass] Конструктор вызван для '" << name << "'" << endl;
    }
    ~TestClass() {
        cout << "[TestClass] ДЕСТРУКТОР вызван для '" << name << "'" << endl;
    }
    
    void print() const {
        cout << "  Объект: " << name << " (" << value << ")" << endl;
    }
};

template <typename T>
class MyUnique {
private:
    T* ptr; 

public:
    explicit MyUnique(T* p = nullptr) : ptr(p) {}

    ~MyUnique() {
        delete ptr;
    }

    MyUnique(const MyUnique& other) = delete;
    MyUnique& operator=(const MyUnique& other) = delete;

    MyUnique(MyUnique&& other) noexcept : ptr(other.ptr) {
        other.ptr = nullptr; 
    }

    MyUnique& operator=(MyUnique&& other) noexcept {
        if (this != &other) {
            delete ptr;       
            ptr = other.ptr;  
            other.ptr = nullptr; 
        }
        return *this;
    }

    T& operator*() const { return *ptr; }
    T* operator->() const { return ptr; }
    
    T* get() const { return ptr; }
};

template <typename T, typename... Args>
MyUnique<T> Make_MyUnique(Args&&... args) {
    return MyUnique<T>(new T(forward<Args>(args)...));
}

template <typename T>
class MyShared {
private:
    T* ptr;           
    size_t* ref_count; 

    void release() {
        if (ref_count) {
            (*ref_count)--; 
            if (*ref_count == 0) {
                delete ptr;       
                delete ref_count; 
            }
        }
    }

public:
    explicit MyShared(T* p = nullptr) : ptr(p), ref_count(p ? new size_t(1) : nullptr) {}

    ~MyShared() {
        release(); 
    }

    MyShared(const MyShared& other) : ptr(other.ptr), ref_count(other.ref_count) {
        if (ref_count) {
            (*ref_count)++;
        }
    }

    MyShared& operator=(const MyShared& other) {
        if (this != &other) {
            release(); 
            ptr = other.ptr;
            ref_count = other.ref_count; 
            if (ref_count) {
                (*ref_count)++;
            }
        }
        return *this;
    }

    MyShared(MyShared&& other) noexcept : ptr(other.ptr), ref_count(other.ref_count) {
        other.ptr = nullptr;
        other.ref_count = nullptr;
    }

    MyShared& operator=(MyShared&& other) noexcept {
        if (this != &other) {
            release();
            ptr = other.ptr;
            ref_count = other.ref_count;
            other.ptr = nullptr;
            other.ref_count = nullptr;
        }
        return *this;
    }

    T& operator*() const { return *ptr; }
    T* operator->() const { return ptr; }
    T* get() const { return ptr; }
    
    size_t use_count() const {
        return ref_count ? *ref_count : 0;
    }
};

template <typename T, typename... Args>
MyShared<T> Make_MyShared(Args&&... args) {
    return MyShared<T>(new T(forward<Args>(args)...));
}

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "1. Демонстрация MyUnique:" << endl;
    {
        MyUnique<TestClass> uniq = Make_MyUnique<TestClass>("UniqueObj1", 10);
        uniq->print();

        MyUnique<TestClass> uniqMoved = move(uniq);
        cout << "Объект успешно перемещен в uniqMoved." << endl;
        if (uniq.get() == nullptr) {
            cout << "Старый указатель uniq теперь равен nullptr." << endl;
        }
        uniqMoved->print();
        
        cout << "[Конец области видимости блока 1 - должен сработать деструктор]" << endl;
    } 

    cout << "\n2. Демонстрация MyShared:" << endl;
    {
        MyShared<TestClass> sh1 = Make_MyShared<TestClass>("SharedObj2", 20);
        cout << "Создан sh1. Счетчик ссылок: " << sh1.use_count() << endl;

        {
            MyShared<TestClass> sh2 = sh1; 
            cout << "Создан (скопирован) sh2. Счетчик ссылок: " << sh1.use_count() << endl;
            sh2->print();

            MyShared<TestClass> sh3 = sh2;
            cout << "Создан sh3. Счетчик ссылок: " << sh1.use_count() << endl;
            
            cout << "[Блок 2.1 завершается, sh2 и sh3 удалятся]" << endl;
        } 

        cout << "Вышли из вложенного блока. Счетчик ссылок: " << sh1.use_count() << endl;
        
        cout << "[Конец области видимости блока 2 - должен сработать деструктор TestClass]" << endl;
    } 

    return 0;
}

```

---

## 1. Шаблонный Класс `MyUnique`

```cpp
template <typename T>
class MyUnique {{
private:
    T* ptr; 
```
Слово `template <typename T>` означает, что наш "умный указатель" может хранить объект абсолютно любого типа (будь то `int` или наш `TestClass` или `vector`), и компилятор будет подставлять этот тип вместо `T`.
В классе хранится всего одна приватная переменная — "сырой" (обычный C++) указатель.

### Запрет копирования
```cpp
    MyUnique(const MyUnique& other) = delete;
    MyUnique& operator=(const MyUnique& other) = delete;
```
Синтаксис `= delete` заставляет компилятор выдавать ошибку красным цветом, если программист попытается скопировать "Уникальный указатель" (`p2 = p1;`). Почему? Потому что если у двух указателей будет один и тот же сырой `ptr`, при закрытии программы они оба вызовут деструкторы, произойдет `delete` дважды, и это сломает память (Segmentation Fault).

### Разрешение перемещения
```cpp
    MyUnique(MyUnique&& other) noexcept : ptr(other.ptr) {{
        other.ptr = nullptr; 
    }}
```
Но мы можем **переместить** указатель. При вызове `move(p1)`, мы "крадем" сырой указатель из старого объекта `other.ptr`, а в старый записываем `nullptr`. Теперь только один новый объект владеет памятью.

## 2. Шаблонный Класс `MyShared`

Концепция `MyShared` в том, что много объектов могут указывать на 1 место в памяти, и это место удалится лишь тогда, когда исчезнет последний указатель.

```cpp
    T* ptr;           
    size_t* ref_count; 
```
Внутри класса `MyShared` хранится два указателя:
1. На сами данные типа `T`.
2. На счетчик ссылок типа `size_t`. Оба выделяются в "куче" (heap). Когда мы копируем умный указатель, мы просто копируем адреса этих двух ячеек, так что все 100 копий объекта смотрят в один и тот же счетчик.

### Механика Копирования и Удаления
```cpp
    MyShared(const MyShared& other) : ptr(other.ptr), ref_count(other.ref_count) {{
        if (ref_count) (*ref_count)++;
    }}
```
При копировании (`sh2 = sh1`) мы просто увеличиваем число в счетчике.

```cpp
    void release() {{
        if (ref_count) {{
            (*ref_count)--; 
            if (*ref_count == 0) {{
                delete ptr;       
                delete ref_count; 
            }}
        }}
    }}
```
Функция `release()` вызывается в деструкторе `~MyShared()`. Она делает -1 счетчику. И если счетчик равен 0, она освобождает из памяти всё: и сам объект `T`, и счетчик.

## 3. Variadic Templates и Функции `Make_...`
```cpp
template <typename T, typename... Args>
MyUnique<T> Make_MyUnique(Args&&... args) {{
    return MyUnique<T>(new T(forward<Args>(args)...));
}}
```
Вместо того чтобы заставлять пользователя писать:
`MyUnique<TestClass> uniq(new TestClass("A", 10));`
Мы реализуем красивую фабрику `Make_MyUnique`.
Система `typename... Args` улавливает любое количество аргументов любого типа ("A", 10, ...). Функция берет этот пакет (`args`), разворачивает его (`args...`), идеально сохраняет типы `&` или `const` за счет `forward` и подставляет это в конструктор целевого класса (`new T(...)`). Наружу возвращается готовый `MyUnique`. Это вершина современного C++ программирования (появилось в C++11 и дорабатывалось в C++14).
