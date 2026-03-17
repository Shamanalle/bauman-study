#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <deque>
#include <list>

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

bool compareByName(const BankDeposit& a, const BankDeposit& b) {
    return a.getName() < b.getName();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    deque<BankDeposit> items;
    BankDeposit temp;

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

    sort(items.begin(), items.end(), compareByName);

    fout << "\nОтсортированный контейнер (по названию):\n";
    cout << "\nОтсортированный контейнер (по названию):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    list<BankDeposit> copied(items.size());
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
