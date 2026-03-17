#include <iostream>
#include <vector>

using namespace std;

class Apartment {
private:
    double totalArea;
    double pricePerSqm;

public:
    Apartment(double area, double price) {
        totalArea = area;
        pricePerSqm = price;
    }

    double getTotalPrice() const {
        return totalArea * pricePerSqm;
    }

    double getArea() const { return totalArea; }
    double getPricePerSqm() const { return pricePerSqm; }

    void print() const {
        cout << "Площадь: " << totalArea << " кв.м, "
             << "Цена за 1 кв.м: " << pricePerSqm << " у.е., "
             << "Общая стоимость: " << getTotalPrice() << " у.е." << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Apartment> apartments = {
        Apartment(45.5, 1200.0),
        Apartment(60.0, 1100.0),
        Apartment(85.2, 1150.0),
        Apartment(33.0, 1300.0),
        Apartment(100.0, 1400.0)
    };

    cout << "Все квартиры:" << endl;
    for (const auto& apt : apartments) {
        apt.print();
    }
    cout << endl;

    double maxPrice;
    cout << "Введите максимальную сумму (стоимость квартиры): ";
    cin >> maxPrice;

    cout << "\nКвартиры стоимостью не более " << maxPrice << " у.е.:" << endl;
    bool found = false;
    for (const auto& apt : apartments) {
        if (apt.getTotalPrice() <= maxPrice) {
            apt.print();
            found = true;
        }
    }

    if (!found) {
        cout << "Квартир, удовлетворяющих данному условию, не найдено." << endl;
    }

    return 0;
}
