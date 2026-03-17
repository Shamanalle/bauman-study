#include <iostream>
#include <vector>
#include <string>
#include <cmath>

using namespace std;

class BankDeposit {
private:
    string owner;
    double amount;
    double rate;

public:
    BankDeposit(string o, double a, double r) {
        owner = o;
        amount = a;
        rate = r;
    }

    double calcAmount(int years) const {
        return amount * pow(1.0 + rate / 100.0, years);
    }

    string getOwner() const { return owner; }
    double getAmount() const { return amount; }
    double getRate() const { return rate; }

    void print() const {
        cout << "Владелец: " << owner
             << ", Сумма: " << amount
             << ", Ставка: " << rate << "%" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<BankDeposit> deposits = {
        BankDeposit("Иванов И.И.", 100000, 7.5),
        BankDeposit("Петров П.П.", 250000, 5.0),
        BankDeposit("Сидоров С.С.", 50000, 10.0),
        BankDeposit("Козлова А.В.", 180000, 6.5),
        BankDeposit("Морозов Д.Е.", 300000, 4.5)
    };

    cout << "Все вклады:" << endl;
    for (const auto& dep : deposits) {
        dep.print();
    }

    int years;
    cout << "\nВведите количество лет: ";
    cin >> years;

    double totalSum = 0;
    cout << "\nСуммы через " << years << " лет:" << endl;
    for (const auto& dep : deposits) {
        double futureAmount = dep.calcAmount(years);
        cout << dep.getOwner() << ": " << futureAmount << endl;
        totalSum += futureAmount;
    }
    cout << "\nОбщая сумма на всех счетах: " << totalSum << endl;

    return 0;
}
