#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Antivirus {
private:
    string name;
    int dbSize;

public:
    Antivirus(string n, int d) {
        name = n;
        dbSize = d;
    }

    string getName() const { return name; }
    int getDbSize() const { return dbSize; }

    void print() const {
        cout << "Антивирус: " << name
             << ", Размер базы: " << dbSize << " записей" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Antivirus> avs = {
        Antivirus("Kaspersky", 850000),
        Antivirus("Norton", 720000),
        Antivirus("DrWeb", 910000),
        Antivirus("Avast", 680000),
        Antivirus("ESET NOD32", 780000)
    };

    cout << "Все антивирусы:" << endl;
    for (const auto& av : avs) {
        av.print();
    }

    int maxDb = 0;
    int maxIdx = 0;
    for (int i = 0; i < avs.size(); ++i) {
        if (avs[i].getDbSize() > maxDb) {
            maxDb = avs[i].getDbSize();
            maxIdx = i;
        }
    }

    cout << "\nАнтивирус с самой большой базой:" << endl;
    avs[maxIdx].print();

    return 0;
}
