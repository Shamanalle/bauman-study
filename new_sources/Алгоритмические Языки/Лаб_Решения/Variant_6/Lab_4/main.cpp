#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <deque>
#include <list>

using namespace std;

class Employee {
private:
    string name;
    string hireDate;
    string position;
    double salary;

public:
    Employee() : name(""), hireDate(""), position(""), salary(0.0) {}

    Employee(string n, string d, string p, double s)
        : name(move(n)), hireDate(move(d)), position(move(p)), salary(s) {}

    Employee(const Employee& other)
        : name(other.name), hireDate(other.hireDate), position(other.position), salary(other.salary) {}

    Employee(Employee&& other) noexcept
        : name(move(other.name)), hireDate(move(other.hireDate)),
          position(move(other.position)), salary(other.salary) {}

    Employee& operator=(const Employee& other) {
        if (this != &other) {
            name = other.name;
            hireDate = other.hireDate;
            position = other.position;
            salary = other.salary;
        }
        return *this;
    }

    Employee& operator=(Employee&& other) noexcept {
        if (this != &other) {
            name = move(other.name);
            hireDate = move(other.hireDate);
            position = move(other.position);
            salary = other.salary;
        }
        return *this;
    }

    string getName() const { return name; }
    double getSalary() const { return salary; }

    friend ostream& operator<<(ostream& os, const Employee& e) {
        os << "Сотрудник: " << e.name << ", Дата приёма: " << e.hireDate
           << ", Должность: " << e.position << ", Оклад: " << e.salary << " руб.";
        return os;
    }

    friend istream& operator>>(istream& is, Employee& e) {
        is >> e.name >> e.hireDate >> e.position >> e.salary;
        return is;
    }
};

bool compareByName(const Employee& a, const Employee& b) {
    return a.getName() < b.getName();
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    deque<Employee> items;
    Employee temp;

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

    fout << "\nОтсортированный контейнер (по ФИО):\n";
    cout << "\nОтсортированный контейнер (по ФИО):\n";
    for (const auto& item : items) {
        fout << item << "\n";
        cout << item << "\n";
    }

    list<Employee> copied(items.size());
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
