#include <iostream>
#include <fstream>
#include <string>
#include <set>
#include <unordered_set>

using namespace std;

class BankLoan {
private:
    string name;
    double amount;
    string currency;
    double interestRate;

public:
    BankLoan() : name(""), amount(0.0), currency("RUB"), interestRate(0.0) {}

    BankLoan(string n, double a, string c, double r)
        : name(move(n)), amount(a), currency(move(c)), interestRate(r) {}

    const string& getName() const { return name; }
    double getAmount() const { return amount; }
    const string& getCurrency() const { return currency; }
    double getInterestRate() const { return interestRate; }

    bool operator<(const BankLoan& other) const {
        if (interestRate != other.interestRate) return interestRate < other.interestRate;
        return name < other.name;
    }

    bool operator==(const BankLoan& other) const {
        return (amount == other.amount &&
                name == other.name &&
                currency == other.currency &&
                interestRate == other.interestRate);
    }

    friend ostream& operator<<(ostream& os, const BankLoan& l) {
        os << "Кредит: '" << l.name << "', Сумма: " << l.amount
           << " " << l.currency << ", Ставка: " << l.interestRate << "%";
        return os;
    }

    friend istream& operator>>(istream& is, BankLoan& l) {
        is >> l.name >> l.amount >> l.currency >> l.interestRate;
        return is;
    }
};

namespace std {
    template<>
    struct hash<BankLoan> {
        size_t operator()(const BankLoan& obj) const {
            size_t h1 = hash<string>()(obj.getName());
            size_t h2 = hash<double>()(obj.getAmount());
            return h1 ^ (h2 << 1);
        }
    };
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    set<BankLoan> orderedSet;
    unordered_set<BankLoan> hashSet;
    
    BankLoan tempObj;

    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
    fin.close();

    cout << "Дерево set (Сортировка по процентной ставке):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }

    cout << "\nХэш-таблица unordered_set (Без порядка):\n";
    for (const auto& item : hashSet) {
        cout << item << endl;
    }

    return 0;
}
