#include <iostream>
#include <fstream>
#include <string>
#include <set>
#include <unordered_set>

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

    const string& getName() const { return name; }
    const string& getHireDate() const { return hireDate; }
    const string& getPosition() const { return position; }
    double getSalary() const { return salary; }

    bool operator<(const Employee& other) const {
        if (salary != other.salary) return salary < other.salary;
        return name < other.name;
    }

    bool operator==(const Employee& other) const {
        return (name == other.name &&
                hireDate == other.hireDate &&
                position == other.position &&
                salary == other.salary);
    }

    friend ostream& operator<<(ostream& os, const Employee& e) {
        os << "Сотрудник: " << e.name << ", Дата: " << e.hireDate
           << ", Должность: " << e.position << ", Оклад: " << e.salary << " руб.";
        return os;
    }

    friend istream& operator>>(istream& is, Employee& e) {
        is >> e.name >> e.hireDate >> e.position >> e.salary;
        return is;
    }
};

namespace std {
    template<>
    struct hash<Employee> {
        size_t operator()(const Employee& obj) const {
            size_t h1 = hash<string>()(obj.getName());
            size_t h2 = hash<double>()(obj.getSalary());
            return h1 ^ (h2 << 1);
        }
    };
}

int main() {
    setlocale(LC_ALL, "Russian");

    ifstream fin("input.txt");

    set<Employee> orderedSet;
    unordered_set<Employee> hashSet;
    
    Employee tempObj;

    while (fin >> tempObj) {
        orderedSet.insert(tempObj); 
        hashSet.insert(tempObj);    
    }
    fin.close();

    cout << "Дерево set (Сортировка по окладу):\n";
    for (const auto& item : orderedSet) {
        cout << item << endl;
    }

    cout << "\nХэш-таблица unordered_set (Без порядка):\n";
    for (const auto& item : hashSet) {
        cout << item << endl;
    }

    return 0;
}
