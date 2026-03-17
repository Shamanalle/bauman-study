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
