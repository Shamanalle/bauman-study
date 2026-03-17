#include <iostream>
#include <string>
#include <stdexcept>
#include <vector>

using namespace std;

class GeomException : public invalid_argument {
private:
    vector<double> err_arr;
    int err_size;
    double err_first;
    double err_ratio;

public:
    GeomException(const string& message, const double* arr, int sz, double f, double r)
        : invalid_argument(message), err_arr(arr, arr + sz), err_size(sz),
          err_first(f), err_ratio(r) {}

    void printErrorData() const {
        cout << "[Детали исключения] Массив не является геометрической прогрессией:" << endl;
        cout << "  Ожидаемый первый элемент: " << err_first << endl;
        cout << "  Ожидаемый знаменатель: " << err_ratio << endl;
        cout << "  Размер: " << err_size << endl;
        cout << "  Элементы: ";
        for (double x : err_arr) cout << x << " ";
        cout << endl;
    }
};

class GeomProgression {
private:
    double first;
    double ratio;
    double* data;
    int size;

    bool isValid(const double* arr, int n) const {
        if (n < 1) return false;
        if (arr[0] != first) return false;
        for (int i = 1; i < n; i++) {
            if (arr[i] != arr[i-1] * ratio) return false;
        }
        return true;
    }

public:
    GeomProgression(double f, double r, const double* arr, int n)
        : first(f), ratio(r) {
        if (!isValid(arr, n)) {
            throw GeomException(
                "Массив не является геометрической прогрессией с заданными параметрами!",
                arr, n, f, r
            );
        }
        size = n;
        data = new double[size];
        for (int i = 0; i < size; i++) data[i] = arr[i];
    }

    ~GeomProgression() { delete[] data; }

    void print() const {
        cout << "Геометрическая прогрессия (b1=" << first << ", q=" << ratio
             << ", n=" << size << "): ";
        for (int i = 0; i < size; i++) cout << data[i] << " ";
        cout << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        double goodArr[] = {3.0, 6.0, 12.0, 24.0, 48.0};
        GeomProgression gp(3.0, 2.0, goodArr, 5);
        cout << "Объект успешно создан!" << endl;
        gp.print();
    }
    catch (const GeomException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        double badArr[] = {3.0, 6.0, 11.0, 24.0};
        GeomProgression gp2(3.0, 2.0, badArr, 4);

        cout << "Этот текст не напечатается." << endl;
        gp2.print();
    }
    catch (const GeomException& e) {
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
