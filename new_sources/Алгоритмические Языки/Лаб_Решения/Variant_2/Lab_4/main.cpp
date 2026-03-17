#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <list>
#include <vector>

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

    BankDeposit(const BankDeposit& other)
        : name(other.name), amount(other.amount), currency(other.currency), rate(other.rate) {}

    BankDeposit(BankDeposit&& other) noexcept
        : name(move(other.name)), amount(other.amount),
          currency(move(other.currency)), rate(other.rate) {}

    BankDeposit& operator=(const BankDeposit& other) {
        if (this != &other) {
            name = other.name;
            amount = other.amount;
            currency = other.currency;
            rate = other.rate;
        }
        return *this;
    }

    BankDeposit& operator=(BankDeposit&& other) noexcept {
        if (this != &other) {
            name = move(other.name);
            amount = other.amount;
            currency = move(other.currency);
            rate = other.rate;
        }
        return *this;
    }

    string getName() const { return name; }
    double getAmount() const { return amount; }

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

bool compareByAmount(const BankDeposit& a, const BankDeposit& b) {
    return a.getAmount() < b.getAmount();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    list<BankDeposit> items;
    BankDeposit temp;

    while (fin >> temp) {
        items.push_back(temp);
    }
    fin.close();

    ofstream fout("output.txt");

    fout << "Исходный контейнер (list):\n";
    cout << "Исходный контейнер (list):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    items.sort(compareByAmount);

    fout << "\nОтсортированный контейнер (по сумме вклада):\n";
    cout << "\nОтсортированный контейнер (по сумме вклада):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    vector<BankDeposit> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());

    fout << "\nСкопированный контейнер (vector):\n";
    cout << "\nСкопированный контейнер (vector):\n";
    for (const auto& item : copied) {
        fout << item << "\n";
        cout << item << "\n";
    }

    fout.close();
    cout << "\nУспех! Результаты сохранены в файл output.txt" << endl;

    return 0;
}
