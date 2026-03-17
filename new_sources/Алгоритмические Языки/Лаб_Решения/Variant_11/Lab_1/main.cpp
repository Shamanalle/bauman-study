#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Firewall {
private:
    string name;
    int fwClass;

public:
    Firewall(string n, int c) {
        name = n;
        fwClass = c;
    }

    bool isSuitable(int requiredClass) const {
        return fwClass <= requiredClass;
    }

    string getName() const { return name; }
    int getFwClass() const { return fwClass; }

    void print() const {
        cout << "МЭ: " << name
             << ", Класс: " << fwClass << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Firewall> firewalls = {
        Firewall("Cisco ASA", 2),
        Firewall("ViPNet", 3),
        Firewall("Континент", 1),
        Firewall("UserGate", 4),
        Firewall("CheckPoint", 2)
    };

    cout << "Все межсетевые экраны:" << endl;
    for (const auto& fw : firewalls) {
        fw.print();
    }

    int reqClass;
    cout << "\nВведите требуемый класс защищённости (1-5): ";
    cin >> reqClass;

    cout << "\nМЭ, подходящие для класса " << reqClass << ":" << endl;
    bool found = false;
    for (const auto& fw : firewalls) {
        if (fw.isSuitable(reqClass)) {
            fw.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Подходящих МЭ не найдено." << endl;
    }

    return 0;
}
