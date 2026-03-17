#include <iostream>
#include <string>
#include <cmath>

using namespace std;

class BankAccount {
protected:
    string owner;
    double initialSum;
    double rate;       // % годовых
    int years;         // время существования вклада

public:
    BankAccount(string o, double s, double r, int y)
        : owner(o), initialSum(s), rate(r), years(y) {}

    virtual double calcSum() const {
        return initialSum * pow(1.0 + rate / 100.0, years);
    }

    virtual void print() const {
        cout << "Банковский счёт:" << endl;
        cout << "  Владелец: " << owner << endl;
        cout << "  Начальная сумма: " << initialSum << " руб." << endl;
        cout << "  Ставка: " << rate << "% годовых" << endl;
        cout << "  Срок вклада: " << years << " лет" << endl;
        cout << "  Сумма на счёте: " << calcSum() << " руб." << endl;
    }

    virtual ~BankAccount() {}
};

class PrivilegedAccount : public BankAccount {
private:
    double creditRate;  // % кредита от суммы на счёте

public:
    PrivilegedAccount(string o, double s, double r, int y, double cr)
        : BankAccount(o, s, r, y), creditRate(cr) {}

    double calcSum() const override {
        double base = BankAccount::calcSum();
        return base + base * (creditRate / 100.0);
    }

    void print() const override {
        BankAccount::print();
        cout << "  Тип: Привилегированный счёт" << endl;
        cout << "  Процент кредита: " << creditRate << "%" << endl;
        cout << "  Сумма с кредитом: " << calcSum() << " руб." << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    BankAccount ba("Иванов Иван Иванович", 100000, 5.0, 3);
    PrivilegedAccount pa("Петров Пётр Петрович", 200000, 7.0, 5, 15.0);

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    ba.print();
    cout << endl;
    pa.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    BankAccount* ptr_b1 = &ba;
    BankAccount* ptr_b2 = &pa;

    cout << "\n[Явный вызов базового метода] ptr_b2->BankAccount::print():" << endl;
    ptr_b2->BankAccount::print();

    cout << "\n[Явный вызов базового calcSum()] ptr_b2->BankAccount::calcSum():" << endl;
    cout << "  Результат (без кредита): " << ptr_b2->BankAccount::calcSum() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_b1->print() (указывает на BankAccount):" << endl;
    ptr_b1->print();

    cout << "\nВызов ptr_b2->print() (указывает на PrivilegedAccount):" << endl;
    ptr_b2->print();

    cout << "\nВызов ptr_b2->calcSum() (указывает на PrivilegedAccount):" << endl;
    cout << "  Результат (с кредитом): " << ptr_b2->calcSum() << endl;

    return 0;
}
