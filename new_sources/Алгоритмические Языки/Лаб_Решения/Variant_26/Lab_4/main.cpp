#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <deque>
#include <list>

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

    Car(const Car& other)
        : model(other.model), maxSpeed(other.maxSpeed), power(other.power) {
        for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
     {}

    Car(Car&& other) noexcept
        : model(move(other.model)), maxSpeed(other.maxSpeed), power(other.power) {
        for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
     {}

    Car& operator=(const Car& other) {
        if (this != &other) {
            model = other.model;
            for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
            maxSpeed = other.maxSpeed;
            power = other.power;
        }
        return *this;
    }

    Car& operator=(Car&& other) noexcept {
        if (this != &other) {
            model = move(other.model);
            for(int i=0;i<3;i++) fuel[i]=other.fuel[i];
            maxSpeed = other.maxSpeed;
            power = other.power;
        }
        return *this;
    }

    string getModel() const { return model; }
    double getMixedFuel() const { return fuel[2]; }

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

bool compareByMixedFuel(const Car& a, const Car& b) {
    return a.getMixedFuel() < b.getMixedFuel();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    deque<Car> items;
    Car temp;

    while (fin >> temp) {
        items.push_back(temp);
    }
    fin.close();

    ofstream fout("output.txt");

    fout << "Исходный контейнер (deque):\n";
    cout << "Исходный контейнер (deque):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    sort(items.begin(), items.end(), compareByMixedFuel);

    fout << "\nОтсортированный контейнер (по смешанному расходу топлива):\n";
    cout << "\nОтсортированный контейнер (по смешанному расходу топлива):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    list<Car> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());

    fout << "\nСкопированный контейнер (list):\n";
    cout << "\nСкопированный контейнер (list):\n";
    for (const auto& item : copied) {
        fout << item << "\n";
        cout << item << "\n";
    }

    fout.close();
    cout << "\nУспех! Результаты сохранены в файл output.txt" << endl;

    return 0;
}
