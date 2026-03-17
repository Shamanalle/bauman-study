#include <iostream>
#include <fstream>
#include <string>
#include <set>
#include <unordered_set>

using namespace std;

class BankDeposit {
private:
    string name;
    double amount;
    string currency;
    double rate;

public:
    BankDeposit() : name(""), amount(0.0), currency("RUB"), rate(0.0) {}

    BankDeposit(string n, double a, string c, double r)
        : name(move(n)), amount(a), currency(move(c)), rate(r) {}

    const string& getName() const { return name; }
    double getAmount() const { return amount; }
    const string& getCurrency() const { return currency; }
    double getRate() const { return rate; }

    bool operator<(const BankDeposit& other) const {
        if (name != other.name) return name < other.name;
        return amount < other.amount;
    }

    bool operator==(const BankDeposit& other) const {
        return (name == other.name &&
                amount == other.amount &&
                currency == other.currency &&
                rate == other.rate);
    }

    friend ostream& operator<<(ostream& os, const BankDeposit& d) {
        os << "Вклад: '" << d.name << "', Сумма: " << d.amount
           << " " << d.currency << ", Ставка: " << d.rate << "%";
        return os;
    }

    friend istream& operator>>(istream& is, BankDeposit& d) {
        is >> d.name >> d.amount >> d.currency >> d.rate;
        return is;
    }
};

namespace std {
    template<>
    struct hash<BankDeposit> {
        size_t operator()(const BankDeposit& obj) const {
            size_t h1 = hash<string>()(obj.getName());
            size_t h2 = hash<double>()(obj.getAmount());
            return h1 ^ (h2 << 1);
        }
    };
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    set<BankDeposit> orderedSet;
    unordered_set<BankDeposit> hashSet;
    
    BankDeposit tempObj;

    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
    fin.close();

    cout << "Дерево set (Сортировка по названию):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }

    cout << "\nХэш-таблица unordered_set (Без порядка):\n";
    for (const auto& item : hashSet) {
        cout << item << endl;
    }

    return 0;
}
