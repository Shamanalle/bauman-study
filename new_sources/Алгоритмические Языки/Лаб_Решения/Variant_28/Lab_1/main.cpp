#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Employee {
private:
    string name;
    double salary;
    double bonus;

public:
    Employee(string n, double s, double b) {
        name = n;
        salary = s;
        bonus = b;
    }

    double getSalaryWithBonus() const {
        return salary + salary * bonus / 100.0;
    }

    string getName() const { return name; }
    double getSalary() const { return salary; }
    double getBonus() const { return bonus; }

    void print() const {
        cout << "ФИО: " << name
             << ", Оклад: " << salary
             << ", Надбавка: " << bonus << "%"
             << ", Зарплата: " << getSalaryWithBonus() << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Employee> employees = {
        Employee("Иванов И.И.", 50000, 15),
        Employee("Петров П.П.", 60000, 10),
        Employee("Сидоров С.С.", 45000, 20),
        Employee("Козлова А.В.", 55000, 12),
        Employee("Морозов Д.Е.", 70000, 8)
    };

    cout << "Все сотрудники:" << endl;
    for (const auto& emp : employees) {
        emp.print();
    }

    double totalSalary = 0;
    for (const auto& emp : employees) {
        totalSalary += emp.getSalaryWithBonus();
    }
    cout << "\nСуммарная зарплата всех сотрудников: " << totalSalary << endl;

    return 0;
}
