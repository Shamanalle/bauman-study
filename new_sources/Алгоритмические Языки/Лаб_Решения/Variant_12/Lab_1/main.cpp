#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class Computer {
private:
    string processor;
    double clockSpeed;

public:
    Computer(string p, double c) {
        processor = p;
        clockSpeed = c;
    }

    string getProcessor() const { return processor; }
    double getClockSpeed() const { return clockSpeed; }

    void print() const {
        cout << "Процессор: " << processor
             << ", Частота: " << clockSpeed << " ГГц" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Computer> computers = {
        Computer("Intel i7-13700K", 5.4),
        Computer("AMD Ryzen 9 7950X", 5.7),
        Computer("Intel i5-12400", 4.4),
        Computer("AMD Ryzen 5 5600X", 4.6),
        Computer("Intel i9-14900K", 6.0)
    };

    cout << "Все компьютеры:" << endl;
    for (const auto& pc : computers) {
        pc.print();
    }

    sort(computers.begin(), computers.end(),
         [](const Computer& a, const Computer& b) {
             return a.getClockSpeed() > b.getClockSpeed();
         });

    cout << "\nКомпьютеры по убыванию частоты:" << endl;
    for (const auto& pc : computers) {
        pc.print();
    }

    return 0;
}
