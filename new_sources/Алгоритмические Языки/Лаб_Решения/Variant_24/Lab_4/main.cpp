#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <list>
#include <vector>

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

    BankLoan(const BankLoan& other)
        : name(other.name), amount(other.amount), currency(other.currency), interestRate(other.interestRate) {}

    BankLoan(BankLoan&& other) noexcept
        : name(move(other.name)), amount(other.amount),
          currency(move(other.currency)), interestRate(other.interestRate) {}

    BankLoan& operator=(const BankLoan& other) {
        if (this != &other) {
            name = other.name;
            amount = other.amount;
            currency = other.currency;
            interestRate = other.interestRate;
        }
        return *this;
    }

    BankLoan& operator=(BankLoan&& other) noexcept {
        if (this != &other) {
            name = move(other.name);
            amount = other.amount;
            currency = move(other.currency);
            interestRate = other.interestRate;
        }
        return *this;
    }

    double getAmount() const { return amount; }
    double getRate() const { return interestRate; }

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

bool compareByRate(const BankLoan& a, const BankLoan& b) {
    return a.getRate() < b.getRate();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    list<BankLoan> items;
    BankLoan temp;

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

    items.sort(compareByRate);

    fout << "\nОтсортированный контейнер (по процентной ставке):\n";
    cout << "\nОтсортированный контейнер (по процентной ставке):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    vector<BankLoan> copied(items.size());
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
