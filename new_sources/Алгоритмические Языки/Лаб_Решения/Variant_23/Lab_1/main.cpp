#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Exhibit {
private:
    string name;
    int days;
    double dailyCost;

public:
    Exhibit(string n, int d, double c) {
        name = n;
        days = d;
        dailyCost = c;
    }

    double getTotalCost() const {
        return days * dailyCost;
    }

    string getName() const { return name; }
    int getDays() const { return days; }
    double getDailyCost() const { return dailyCost; }

    void print() const {
        cout << "Экспонат: " << name
             << ", Дней: " << days
             << ", Цена/день: " << dailyCost
             << ", Итого: " << getTotalCost() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Exhibit> exhibits = {
        Exhibit("Картина Айвазовского", 30, 5000),
        Exhibit("Скульптура Родена", 14, 8000),
        Exhibit("Фарфоровая ваза", 60, 2000),
        Exhibit("Древний манускрипт", 7, 15000),
        Exhibit("Коллекция монет", 45, 3000)
    };

    cout << "Все экспонаты:" << endl;
    for (const auto& e : exhibits) {
        e.print();
    }

    double maxCost = 0;
    int maxIdx = 0;
    for (int i = 0; i < exhibits.size(); ++i) {
        if (exhibits[i].getTotalCost() > maxCost) {
            maxCost = exhibits[i].getTotalCost();
            maxIdx = i;
        }
    }

    cout << "\nЭкспонат с максимальной стоимостью экспонирования:" << endl;
    exhibits[maxIdx].print();

    return 0;
}
