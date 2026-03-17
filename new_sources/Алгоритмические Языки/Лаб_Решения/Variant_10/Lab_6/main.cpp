#include <iostream>
#include <string>
#include <stdexcept>

using namespace std;

class TimeException : public out_of_range {
private:
    int err_hours;
    int err_minutes;
    int err_seconds;

public:
    TimeException(const string& message, int h, int m, int s)
        : out_of_range(message), err_hours(h), err_minutes(m), err_seconds(s) {}

    void printErrorData() const {
        cout << "[Детали исключения] Недопустимое время:" << endl;
        cout << "  Часы:    " << err_hours   << " (допустимо: 0-23)" << endl;
        cout << "  Минуты:  " << err_minutes << " (допустимо: 0-59)" << endl;
        cout << "  Секунды: " << err_seconds << " (допустимо: 0-59)" << endl;
    }
};

class Time {
private:
    int hours;
    int minutes;
    int seconds;

public:
    Time(int h, int m, int s) {
        if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) {
            throw TimeException(
                "Одно или несколько полей времени выходят за допустимый диапазон!",
                h, m, s
            );
        }
        hours = h;
        minutes = m;
        seconds = s;
    }

    void print() const {
        cout << "Время: " << hours << ":" << minutes << ":" << seconds << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        Time validTime(14, 30, 45);
        cout << "Объект успешно создан!" << endl;
        validTime.print();
    }
    catch (const TimeException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        Time invalidTime(25, -1, 61);

        cout << "Этот текст не напечатается, объект не создан." << endl;
        invalidTime.print();
    }
    catch (const TimeException& e) {
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
