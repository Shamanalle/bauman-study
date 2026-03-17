#include <iostream>
#include <fstream>
#include <string>
#include <set>
#include <unordered_set>

using namespace std;

class Car {
private:
    string model;
    double fuel[3]; // трасса, город, смешанный
    double maxSpeed;
    int power;

public:
    Car() : model(""), maxSpeed(0), power(0) { fuel[0]=fuel[1]=fuel[2]=0; }

    Car(string m, double f1, double f2, double f3, double s, int p)
        : model(move(m)), maxSpeed(s), power(p) {
        fuel[0]=f1; fuel[1]=f2; fuel[2]=f3;
    }

    const string& getModel() const { return model; }
    double getMixedFuel() const { return fuel[2]; }
    double getMaxSpeed() const { return maxSpeed; }
    int getPower() const { return power; }

    bool operator<(const Car& other) const {
        if (fuel[2] != other.fuel[2]) return fuel[2] < other.fuel[2];
        return model < other.model;
    }

    bool operator==(const Car& other) const {
        return (model == other.model &&
                fuel[0]==other.fuel[0] && fuel[1]==other.fuel[1] && fuel[2]==other.fuel[2] &&
                maxSpeed == other.maxSpeed &&
                power == other.power);
    }

    friend ostream& operator<<(ostream& os, const Car& c) {
        os << "Авто: " << c.model << ", Расход (трасса/город/смеш): "
           << c.fuel[0] << "/" << c.fuel[1] << "/" << c.fuel[2]
           << " л/100км, Макс: " << c.maxSpeed << " км/ч, " << c.power << " л.с.";
        return os;
    }

    friend istream& operator>>(istream& is, Car& c) {
        is >> c.model >> c.fuel[0] >> c.fuel[1] >> c.fuel[2] >> c.maxSpeed >> c.power;
        return is;
    }
};

namespace std {
    template<>
    struct hash<Car> {
        size_t operator()(const Car& obj) const {
            size_t h1 = hash<string>()(obj.getModel());
            size_t h2 = hash<int>()(obj.getPower());
            return h1 ^ (h2 << 1);
        }
    };
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    set<Car> orderedSet;
    unordered_set<Car> hashSet;
    
    Car tempObj;

    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
    fin.close();

    cout << "Дерево set (Сортировка по смешанному расходу топлива):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }

    cout << "\nХэш-таблица unordered_set (Без порядка):\n";
    for (const auto& item : hashSet) {
        cout << item << endl;
    }

    return 0;
}
