#include <iostream>
#include <string>
#include <stdexcept>

using namespace std;

class PointException : public out_of_range {
private:
    double err_x;
    double err_y;
    double err_z;

public:
    PointException(const string& message, double x, double y, double z)
        : out_of_range(message), err_x(x), err_y(y), err_z(z) {}

    void printErrorData() const {
        cout << "[Детали исключения] Недопустимые координаты точки:" << endl;
        cout << "X = " << err_x << endl;
        cout << "Y = " << err_y << endl;
        cout << "Z = " << err_z << endl;
    }
};

class UnitCubePoint {
private:
    double x;
    double y;
    double z;
    
    bool isValid(double coord) const {
        return (coord >= 0.0 && coord <= 1.0);
    }

public:
    UnitCubePoint(double p_x, double p_y, double p_z) {
        if (!isValid(p_x) || !isValid(p_y) || !isValid(p_z)) {
            throw PointException(
                "Одна или несколько координат выходят за пределы единичного куба [0, 1]!", 
                p_x, p_y, p_z
            );
        }
        
        x = p_x;
        y = p_y;
        z = p_z;
    }

    void print() const {
        cout << "Точка в кубе: (" << x << ", " << y << ", " << z << ")" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "Демонстрация работы БЕЗ возникновения исключения:" << endl;
    try {
        UnitCubePoint validPoint(0.5, 0.1, 0.99);
        cout << "Объект успешно создан!" << endl;
        validPoint.print();
    }
    catch (const PointException& e) {
        cerr << "Перехвачено исключение: " << e.what() << endl;
        e.printErrorData();
    }
    catch (const exception& e) {
        cerr << "Стандартное исключение: " << e.what() << endl;
    }

    cout << "\nДемонстрация работы С возникновением исключения:" << endl;
    try {
        UnitCubePoint invalidPoint(1.5, 0.5, -0.2);
        
        cout << "Этот текст не напечатается, объект не создан." << endl;
        invalidPoint.print(); 
    }
    catch (const PointException& e) {
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
