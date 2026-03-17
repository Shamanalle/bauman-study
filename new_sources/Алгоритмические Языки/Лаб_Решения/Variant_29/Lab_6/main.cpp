#include <iostream>
#include <string>
#include <stdexcept>

using namespace std;

class DateException : public out_of_range {
private:
    int err_day;
    int err_month;
    int err_year;

public:
    DateException(const string& message, int d, int m, int y)
        : out_of_range(message), err_day(d), err_month(m), err_year(y) {}

    void printErrorData() const {
        cout << "[Детали исключения] Недопустимая дата:" << endl;
        cout << "  День:  " << err_day   << " (допустимо: 1-31)" << endl;
        cout << "  Месяц: " << err_month << " (допустимо: 1-12)" << endl;
        cout << "  Год:   " << err_year  << " (допустимо: 1900-2100)" << endl;
    }
};

class Date {
private:
    int day;
    int month;
    int year;

public:
    Date(int d, int m, int y) {
        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
            throw DateException(
                "Одно или несколько полей даты выходят за допустимый диапазон!",
                d, m, y
            );
        }
        day = d;
        month = m;
        year = y;
    }

    void print() const {
        cout << "Дата: " << day << "." << month << "." << year << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        Date validDate(15, 6, 2024);
        cout << "Объект успешно создан!" << endl;
        validDate.print();
    }
    catch (const DateException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        Date invalidDate(32, 13, 1800);

        cout << "Этот текст не напечатается, объект не создан." << endl;
        invalidDate.print();
    }
    catch (const DateException& e) {
        cerr << "\nПерехвачено ожидаемое исключение:" << endl;
        cerr << "Сообщение (базовый класс out_of_range): " << e.what() << endl;
        e.printErrorData();
    }
    catch (const out_of_range& e) {
        cerr << "out_of_range перехвачен: " << e.what() << endl;
    }
    catch (const exception& e) {
        cerr << "Произошла неизвестная ошибка: " << e.what() << endl;
    }

    cout << "\nПрограмма успешно завершила свою работу после обработки исключения." << endl;

    return 0;
}
