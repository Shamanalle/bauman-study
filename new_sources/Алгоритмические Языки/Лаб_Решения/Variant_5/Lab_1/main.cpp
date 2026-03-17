#include <iostream>
#include <vector>
#include <string>

using namespace std;

class CryptoMethod {
private:
    string name;
    string type;

public:
    CryptoMethod(string n, string t) {
        name = n;
        type = t;
    }

    string getName() const { return name; }
    string getType() const { return type; }

    void print() const {
        cout << "Метод: " << name << ", Тип: " << type << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<CryptoMethod> methods = {
        CryptoMethod("AES-256", "symmetric"),
        CryptoMethod("RSA", "asymmetric"),
        CryptoMethod("DES", "symmetric"),
        CryptoMethod("ECC", "asymmetric"),
        CryptoMethod("Blowfish", "symmetric")
    };

    cout << "Все криптографические методы:" << endl;
    for (const auto& m : methods) {
        m.print();
    }

    string reqType;
    cout << "\nВведите тип (symmetric/asymmetric): ";
    cin >> reqType;

    cout << "\nМетоды типа '" << reqType << "':" << endl;
    bool found = false;
    for (const auto& m : methods) {
        if (m.getType() == reqType) {
            m.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Методов данного типа не найдено." << endl;
    }

    return 0;
}
