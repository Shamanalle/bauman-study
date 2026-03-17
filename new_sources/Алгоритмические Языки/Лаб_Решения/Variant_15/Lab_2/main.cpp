#include <iostream>
#include <fstream>

using namespace std;

class Vector {
private:
    int* p = nullptr; 
    int n = 0;         

public:
    Vector() {
        p = nullptr;
        n = 0;
    }

    Vector(const int* arr, int size) {
        n = size;
        p = new int[n];
        for (int i = 0; i < n; i++) {
            p[i] = arr[i];
        }
    }

    Vector(const Vector& V) {
        n = V.n;
        p = new int[n];
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

    int& operator[](int index) {
        return p[index];
    }
    
    const int& operator[](int index) const {
        return p[index];
    }

    Vector& operator=(const Vector& v2) {
        if (this != &v2) { 
            delete[] p; 
            n = v2.n;
            p = new int[n];
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
    friend Vector operator^(const Vector& v1, const Vector& v2);
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
    int* new_p = new int[new_n];
    for (int i = 0; i < new_n; ++i) {
        is >> new_p[i];
    }
    Vector temp(new_p, new_n);
    v = move(temp); 
    delete[] new_p;
    return is;
}
Vector operator^(const Vector& v1, const Vector& v2) {
    Vector result(v1);
    for (int i = 0; i < v1.size(); i++) {
        result[i] = v1[i] ^ v2[i];
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
    int tempArr[] = {5, 3, 8, 1, 4};
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

    cout << "\n7. Операция ^ (побитовое XOR): Vector ^ Vector\n";
    Vector v6 = v2 ^ v5;
    cout << "v2 ^ v5 = " << v6 << endl;

    cout << "\n8. Вывод в файл output.txt\n";
    ofstream fout("output.txt");
    fout << "Вектор v1: " << v1 << "\n";
    fout << "Вектор v2: " << v2 << "\n";
    fout.close();
    cout << "Данные успешно выведены в output.txt" << endl;

    return 0;
}
