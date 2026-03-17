#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <vector>
#include <deque>

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

bool compareByAmount(const BankLoan& a, const BankLoan& b) {
    return a.getAmount() < b.getAmount();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    vector<BankLoan> items;
    BankLoan temp;

    while (fin >> temp) {
        items.push_back(temp);
    }
    fin.close();

    ofstream fout("output.txt");

    fout << "Исходный контейнер (vector):\n";
    cout << "Исходный контейнер (vector):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    sort(items.begin(), items.end(), compareByAmount);

    fout << "\nОтсортированный контейнер (по сумме кредита):\n";
    cout << "\nОтсортированный контейнер (по сумме кредита):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    deque<BankLoan> copied(items.size());
    copy(items.begin(), items.end(), copied.begin());

    fout << "\nСкопированный контейнер (deque):\n";
    cout << "\nСкопированный контейнер (deque):\n";
    for (const auto& item : copied) {
        fout << item << "\n";
        cout << item << "\n";
    }

    fout.close();
    cout << "\nУспех! Результаты сохранены в файл output.txt" << endl;

    return 0;
}
