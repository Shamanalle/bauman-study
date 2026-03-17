#include <iostream>
#include <string>

using namespace std;

class Employee {
protected:
    string name;
    double salary;
    double bonusPerYear;  // % от оклада за 1 год стажа
    int experience;       // стаж в годах

public:
    Employee(string n, double s, double b, int e)
        : name(n), salary(s), bonusPerYear(b), experience(e) {}

    virtual double calcSalary() const {
        return salary + salary * (bonusPerYear / 100.0) * experience;
    }

    virtual void print() const {
        cout << "Сотрудник:" << endl;
        cout << "  ФИО: " << name << endl;
        cout << "  Оклад: " << salary << " руб." << endl;
        cout << "  Надбавка за стаж: " << bonusPerYear << "% за год" << endl;
        cout << "  Стаж: " << experience << " лет" << endl;
        cout << "  Зарплата: " << calcSalary() << " руб." << endl;
    }

    virtual ~Employee() {}
};

class Manager : public Employee {
private:
    double managerBonus;  // % надбавка за руководство
    string department;

public:
    Manager(string n, double s, double b, int e, double mb, string dept)
        : Employee(n, s, b, e), managerBonus(mb), department(dept) {}

    double calcSalary() const override {
        return Employee::calcSalary() + salary * (managerBonus / 100.0);
    }

    void print() const override {
        Employee::print();
        cout << "  Должность: Начальник подразделения" << endl;
        cout << "  Подразделение: " << department << endl;
        cout << "  Надбавка за руководство: " << managerBonus << "%" << endl;
        cout << "  Итого зарплата начальника: " << calcSalary() << " руб." << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    Employee emp("Иванов Иван Иванович", 50000, 2.0, 10);
    Manager mgr("Петров Пётр Петрович", 70000, 1.5, 15, 25.0, "IT-отдел");

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    emp.print();
    cout << endl;
    mgr.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    Employee* ptr_e1 = &emp;
    Employee* ptr_e2 = &mgr;

    cout << "\n[Явный вызов базового метода] ptr_e2->Employee::print():" << endl;
    ptr_e2->Employee::print();

    cout << "\n[Явный вызов базового calcSalary()] ptr_e2->Employee::calcSalary():" << endl;
    cout << "  Результат (зарплата сотрудника): " << ptr_e2->Employee::calcSalary() << endl;

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_e1->print() (указывает на Employee):" << endl;
    ptr_e1->print();

    cout << "\nВызов ptr_e2->print() (указывает на Manager):" << endl;
    ptr_e2->print();

    cout << "\nВызов ptr_e2->calcSalary() (указывает на Manager):" << endl;
    cout << "  Результат (зарплата начальника): " << ptr_e2->calcSalary() << endl;

    return 0;
}
