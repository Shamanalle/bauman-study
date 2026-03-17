#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Racehorse {
private:
    string nickname;
    double records[5];

public:
    Racehorse(string n, double r1, double r2, double r3, double r4, double r5) {
        nickname = n;
        records[0] = r1; records[1] = r2; records[2] = r3;
        records[3] = r4; records[4] = r5;
    }

    double getAverageTime() const {
        double sum = 0;
        for (int i = 0; i < 5; ++i) sum += records[i];
        return sum / 5.0;
    }

    string getNickname() const { return nickname; }

    void print() const {
        cout << "Кличка: " << nickname << ", Рекорды:";
        for (int i = 0; i < 5; ++i) cout << " " << records[i];
        cout << ", Среднее: " << getAverageTime() << " с" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Racehorse> horses = {
        Racehorse("Буран", 62.5, 63.1, 61.8, 64.0, 62.0),
        Racehorse("Стрела", 58.2, 59.0, 57.5, 60.1, 58.8),
        Racehorse("Гром", 65.0, 64.3, 66.1, 63.5, 65.7),
        Racehorse("Вихрь", 60.0, 61.2, 59.8, 60.5, 61.0),
        Racehorse("Молния", 55.3, 56.0, 54.8, 55.9, 56.2)
    };

    cout << "Все лошади:" << endl;
    for (const auto& h : horses) {
        h.print();
    }

    double totalAvg = 0;
    for (const auto& h : horses) {
        totalAvg += h.getAverageTime();
    }
    totalAvg /= horses.size();

    cout << "\nСреднее время по всей конюшне: " << totalAvg << " с" << endl;

    return 0;
}
