#include <iostream>
#include <string>
#include <stdexcept>
#include <vector>

using namespace std;

class ArithException : public invalid_argument {
private:
    vector<double> err_arr;
    int err_size;
    double err_first;
    double err_diff;

public:
    ArithException(const string& message, const double* arr, int sz, double f, double d)
        : invalid_argument(message), err_arr(arr, arr + sz), err_size(sz),
          err_first(f), err_diff(d) {}

    void printErrorData() const {
        cout << "[Детали исключения] Массив не является арифметической прогрессией:" << endl;
        cout << "  Ожидаемый первый элемент: " << err_first << endl;
        cout << "  Ожидаемая разность: " << err_diff << endl;
        cout << "  Размер: " << err_size << endl;
        cout << "  Элементы: ";
        for (double x : err_arr) cout << x << " ";
        cout << endl;
    }
};

class ArithProgression {
private:
    double first;
    double diff;
    double* data;
    int size;

    bool isValid(const double* arr, int n) const {
        if (n < 1) return false;
        if (arr[0] != first) return false;
        for (int i = 1; i < n; i++) {
            if (arr[i] != arr[i-1] + diff) return false;
        }
        return true;
    }

public:
    ArithProgression(double f, double d, const double* arr, int n)
        : first(f), diff(d) {
        if (!isValid(arr, n)) {
            throw ArithException(
                "Массив не является арифметической прогрессией с заданными параметрами!",
                arr, n, f, d
            );
        }
        size = n;
        data = new double[size];
        for (int i = 0; i < size; i++) data[i] = arr[i];
    }

    ~ArithProgression() { delete[] data; }

    void print() const {
        cout << "Арифметическая прогрессия (a1=" << first << ", d=" << diff
             << ", n=" << size << "): ";
        for (int i = 0; i < size; i++) cout << data[i] << " ";
        cout << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        double goodArr[] = {2.0, 5.0, 8.0, 11.0, 14.0};
        ArithProgression ap(2.0, 3.0, goodArr, 5);
        cout << "Объект успешно создан!" << endl;
        ap.print();
    }
    catch (const ArithException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        double badArr[] = {2.0, 5.0, 9.0, 11.0};
        ArithProgression ap2(2.0, 3.0, badArr, 4);

        cout << "Этот текст не напечатается." << endl;
        ap2.print();
    }
    catch (const ArithException& e) {
        cerr << "\nПерехвачено ожидаемое исключение:" << endl;
        cerr << "Сообщение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const invalid_argument& e) {
        cerr << "invalid_argument: " << e.what() << endl;
    }
    catch (const exception& e) {
        cerr << "Неизвестная ошибка: " << e.what() << endl;
    }

    cout << "\nПрограмма успешно завершила свою работу." << endl;
    return 0;
}
