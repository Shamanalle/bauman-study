#include <iostream>
#include <vector>
#include <string>

using namespace std;

class SecurityTool {
private:
    string name;
    int securityClass;

public:
    SecurityTool(string n, int sc) {
        name = n;
        securityClass = sc;
    }

    bool isSuitable(int requiredClass) const {
        return securityClass <= requiredClass;
    }

    string getName() const { return name; }
    int getSecurityClass() const { return securityClass; }

    void print() const {
        cout << "Название: " << name
             << ", Класс защищённости: " << securityClass << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<SecurityTool> tools = {
        SecurityTool("SecureShield Pro", 2),
        SecurityTool("DataGuard", 4),
        SecurityTool("CryptoWall", 1),
        SecurityTool("NetProtect", 5),
        SecurityTool("AccessControl", 3)
    };

    cout << "Все средства защиты:" << endl;
    for (const auto& tool : tools) {
        tool.print();
    }

    int reqClass;
    cout << "\nВведите требуемый класс защищённости (1-7): ";
    cin >> reqClass;

    cout << "\nСредства, подходящие для класса " << reqClass << ":" << endl;
    bool found = false;
    for (const auto& tool : tools) {
        if (tool.isSuitable(reqClass)) {
            tool.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Подходящих средств не найдено." << endl;
    }

    return 0;
}
