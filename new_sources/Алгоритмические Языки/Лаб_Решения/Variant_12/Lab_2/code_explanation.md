# Разбор кода: Лабораторная работа 2 (Вариант 12)

Ниже представлен полный исходный код из `main.cpp` для удобного ознакомления. 
В последующих разделах этот код разбит на логические блоки с детальным объяснением реализации класса `Vector` с перегрузкой операторов.

## Полный исходный код программы
```cpp
#include <iostream>
#include <fstream>

using namespace std;

class Vector {
private:
    double* p = nullptr; 
    int n = 0;         

public:
    Vector() {
        p = nullptr;
        n = 0;
    }

    Vector(const double* arr, int size) {
        n = size;
        p = new double[n];
        for (int i = 0; i < n; i++) {
            p[i] = arr[i];
        }
    }

    Vector(const Vector& V) {
        n = V.n;
        p = new double[n];
        for (int i = 0; i < n; i++) {
            p[i] = V.p[i];
        }
    }

    Vector(Vector&& V) noexcept {
        p = V.p;
        n = V.n;
        V.p = nullptr;
        V.n = 0;
    }

    ~Vector() {
        if (p != nullptr) {
            delete[] p;
        }
    }

    double& operator[](int index) {
        return p[index];
    }
    
    const double& operator[](int index) const {
        return p[index];
    }

    Vector& operator=(const Vector& v2) {
        if (this != &v2) { 
            delete[] p; 
            n = v2.n;
            p = new double[n];
            for (int i = 0; i < n; i++) {
                p[i] = v2.p[i];
            }
        }
        return *this;
    }

    Vector& operator=(Vector&& v2) noexcept {
        if (this != &v2) { 
            delete[] p; 
            p = v2.p;
            n = v2.n;
            v2.p = nullptr;
            v2.n = 0;
        }
        return *this;
    }

    int size() const {
        return n;
    }

    friend ostream& operator<<(ostream& os, const Vector& v);
    friend istream& operator>>(istream& is, Vector& v);
    friend double operator*(const Vector& v, const double* arr);
};


ostream& operator<<(ostream& os, const Vector& v) {
    os << v.n << " | "; 
    for (int i = 0; i < v.n; ++i) {
        os << v.p[i] << " ";
    }
    return os;
}

istream& operator>>(istream& is, Vector& v) {
    int new_n;
    is >> new_n;
    double* new_p = new double[new_n];
    for (int i = 0; i < new_n; ++i) {
        is >> new_p[i];
    }
    Vector temp(new_p, new_n);
    v = move(temp); 
    delete[] new_p;
    return is;
}
double operator*(const Vector& v, const double* arr) {
    double result = 0;
    for (int i = 0; i < v.size(); i++) {
        result += v[i] * arr[i];
    }
    return result;
}


int main() {
    setlocale(LC_ALL, "Russian");

    cout << "1. Чтение данных из файла input.txt\n";
    ifstream fin("input.txt");

    Vector v1;
    fin >> v1; 
    fin.close();
    
    cout << "Вектор v1 (прочитан из файла): " << v1 << endl;

    cout << "\n2. Создание вектора из массива\n";
    double tempArr[] = {1.5, 2.5, 3.0, 4.0, 5.5};
    Vector v2(tempArr, 5); 
    cout << "Вектор v2: " << v2 << endl;

    cout << "\n3. Демонстрация конструктора копирования\n";
    Vector v3 = v2; 
    cout << "Вектор v3 (копия v2): " << v3 << endl;

    cout << "\n4. Демонстрация конструктора перемещения\n";
    Vector v4 = move(v3); 
    cout << "Вектор v4 (после перемещения из v3): " << v4 << endl;
    cout << "Вектор v3 (после перемещения из него): " << v3 << endl;

    cout << "\n5. Демонстрация операции =\n";
    Vector v5;
    v5 = v2; 
    cout << "Вектор v5 (после v5 = v2): " << v5 << endl;

    cout << "\n6. Демонстрация операции []\n";
    cout << "v5[0] = " << v5[0] << endl;

    cout << "\n7. Операция * (скалярное произведение): Vector * double*\n";
    double arr_op[] = {2.0, 3.0, 1.0, 0.5, 4.0};
    double dotProduct = v2 * arr_op;
    cout << "v2 * arr_op = " << dotProduct << endl;

    cout << "\n8. Вывод в файл output.txt\n";
    ofstream fout("output.txt");
    fout << "Вектор v1: " << v1 << "\n";
    fout << "Вектор v2: " << v2 << "\n";
    fout.close();
    cout << "Данные успешно выведены в output.txt" << endl;

    return 0;
}

```

---

## 1. "Правило Пяти" (The Rule of Five)
Поскольку класс `Vector` хранит указатель `double* p`, память под который выделяется динамически через `new`, мы обязаны вручную реализовывать 5 специальных методов для управления этой памятью.

### 1) Деструктор
```cpp
    ~Vector() {
        if (p != nullptr) delete[] p;
    }
```
Вызывается автоматически при удалении объекта. Возвращает память операционной системе (`delete[]`), предотвращая утечки памяти.

### 2) Конструктор копирования
```cpp
    Vector(const Vector& V) {
        n = V.n;
        p = new double[n];
        for (int i = 0; i < n; i++) p[i] = V.p[i];
    }
```
Создает **глубокую копию** (deep copy): выделяет полностью новый массив `p` и копирует элементы, чтобы два вектора не указывали на одну и ту же область памяти.

### 3) Конструктор перемещения
```cpp
    Vector(Vector&& V) noexcept {
        p = V.p;  n = V.n;
        V.p = nullptr;  V.n = 0;
    }
```
Использует rvalue-ссылку `&&`. Забирает указатель у временного объекта вместо дорогого копирования.

### 4-5) Операторы присваивания
Копирующий `operator=(const Vector&)` аналогичен конструктору копирования, перемещающий `operator=(Vector&&)` — конструктору перемещения. Оба проверяют самоприсваивание через `if (this != &v2)`.

---

## 2. Перегрузка операторов

### Оператор `[]`
```cpp
    double& operator[](int index) { return p[index]; }
```
Возвращает **ссылку**, чтобы можно было писать `v[0] = значение;`.

### Операторы потоков `<<` и `>>`
```cpp
friend ostream& operator<<(ostream& os, const Vector& v);
```
Ключевое слово `friend` позволяет внешней функции читать приватное поле `p`. Возвращает `ostream&` для цепочек: `cout << v1 << v2;`.

### Задание: Скалярное произведение с массивом (`*`)
Правый операнд — `double*`. Результат — `double`, не `Vector`.


## 3. Чтение и запись в файл
```cpp
    ifstream fin("input.txt");
    fin >> v1;        // перегруженный operator>>
    ofstream fout("output.txt");
    fout << v1;       // перегруженный operator<<
```
Благодаря перегрузке, мы читаем/пишем векторы из/в файл точно так же, как из/в консоль.
