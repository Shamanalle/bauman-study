#include <iostream>
#include <string>

using namespace std;

class School {
protected:
    string name;
    int students;

public:
    School(string n, int s) : name(n), students(s) {}

    virtual void print() const {
        cout << "Школа:" << endl;
        cout << "  Название: " << name << endl;
        cout << "  Число учеников: " << students << endl;
    }

    virtual ~School() {}
};

class SpecialSchool : public School {
private:
    string specialization;

public:
    SpecialSchool(string n, int s, string spec) : School(n, s), specialization(spec) {}

    void print() const override {
        School::print();
        cout << "  Тип: Специализированная школа" << endl;
        cout << "  Специализация: " << specialization << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    cout << "=== Создание объектов ===" << endl;
    School sch("Школа №1", 500);
    SpecialSchool ssch("Лицей №2", 300, "Математика и Информатика");

    cout << "\n=== Прямой вызов функций (объекты) ===" << endl;
    sch.print();
    cout << endl;
    ssch.print();

    cout << "\n=== 1. СТАТИЧЕСКИЙ ПОЛИМОРФИЗМ (Статическое связывание) ===" << endl;

    School* ptr_s1 = &sch;
    School* ptr_s2 = &ssch;

    cout << "\n[Явный вызов базового метода] ptr_s2->School::print():" << endl;
    ptr_s2->School::print();

    cout << "\n=== 2. ДИНАМИЧЕСКИЙ ПОЛИМОРФИЗМ (Динамическое связывание) ===" << endl;

    cout << "\nВызов ptr_s1->print() (указывает на School):" << endl;
    ptr_s1->print();

    cout << "\nВызов ptr_s2->print() (указывает на SpecialSchool):" << endl;
    ptr_s2->print();

    return 0;
}
