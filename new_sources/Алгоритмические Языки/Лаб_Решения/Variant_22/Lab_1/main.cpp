#include <iostream>
#include <vector>

using namespace std;

class ApartmentRooms {
private:
    double totalPrice;
    int rooms;

public:
    ApartmentRooms(double price, int r) {
        totalPrice = price;
        rooms = r;
    }

    double getRoomPrice() const {
        return (rooms > 0) ? totalPrice / rooms : 0;
    }

    double getTotalPrice() const { return totalPrice; }
    int getRooms() const { return rooms; }

    void print() const {
        cout << "Стоимость: " << totalPrice
             << ", Комнат: " << rooms
             << ", Цена за комнату: " << getRoomPrice() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<ApartmentRooms> apartments = {
        ApartmentRooms(5000000, 3),
        ApartmentRooms(3000000, 1),
        ApartmentRooms(8000000, 4),
        ApartmentRooms(4500000, 2),
        ApartmentRooms(12000000, 5)
    };

    cout << "Все квартиры:" << endl;
    for (const auto& apt : apartments) {
        apt.print();
    }

    double maxRoomPrice;
    cout << "\nВведите макс. стоимость одной комнаты: ";
    cin >> maxRoomPrice;

    cout << "\nКвартиры с ценой за комнату <= " << maxRoomPrice << ":" << endl;
    bool found = false;
    for (const auto& apt : apartments) {
        if (apt.getRoomPrice() <= maxRoomPrice) {
            apt.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Таких квартир не найдено." << endl;
    }

    return 0;
}
