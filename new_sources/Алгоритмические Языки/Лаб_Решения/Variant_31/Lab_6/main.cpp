#include <iostream>
#include <string>
#include <stdexcept>
#include <cmath>

using namespace std;

class PrimeException : public invalid_argument {
private:
    int err_value;

public:
    PrimeException(const string& message, int v)
        : invalid_argument(message), err_value(v) {}

    void printErrorData() const {
        cout << "[Детали исключения] Число не является простым:" << endl;
        cout << "  Значение: " << err_value << endl;
    }
};

class PrimeNumber {
private:
    int value;

    bool isPrime(int n) const {
        if (n < 2) return false;
        for (int i = 2; i <= (int)sqrt(n); i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

public:
    PrimeNumber(int v) {
        if (!isPrime(v)) {
            throw PrimeException(
                "Переданное число не является простым!",
                v
            );
        }
        value = v;
    }

    void print() const {
        cout << "Простое число: " << value << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        PrimeNumber p1(17);
        cout << "Объект успешно создан!" << endl;
        p1.print();
    }
    catch (const PrimeException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        PrimeNumber p2(15);

        cout << "Этот текст не напечатается, объект не создан." << endl;
        p2.print();
    }
    catch (const PrimeException& e) {
        cerr << "\nПерехвачено ожидаемое исключение:" << endl;
        cerr << "Сообщение (базовый класс invalid_argument): " << e.what() << endl;
        e.printErrorData();
    }
    catch (const invalid_argument& e) {
        cerr << "invalid_argument перехвачен: " << e.what() << endl;
    }
    catch (const exception& e) {
        cerr << "Произошла неизвестная ошибка: " << e.what() << endl;
    }

    cout << "\nПрограмма успешно завершила свою работу после обработки исключения." << endl;

    return 0;
}
