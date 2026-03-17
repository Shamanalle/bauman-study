#include <iostream>
#include <vector>
#include <string>

using namespace std;

class Student {
private:
    string name;
    vector<int> grades;

public:
    Student(string n, vector<int> g) {
        name = n;
        grades = g;
    }

    bool canGetStipend() const {
        for (int grade : grades) {
            if (grade <= 3) return false;
        }
        return true;
    }

    string getName() const { return name; }

    void print() const {
        cout << "ФИО: " << name << ", Оценки:";
        for (int g : grades) cout << " " << g;
        cout << ", Стипендия: " << (canGetStipend() ? "Да" : "Нет") << endl;
    }
};

int main() {
    setlocale(LC_ALL, "Russian");

    vector<Student> students = {
        Student("Иванов И.И.", {5, 4, 5, 4}),
        Student("Петров П.П.", {3, 4, 5, 4}),
        Student("Сидоров С.С.", {5, 5, 5, 5}),
        Student("Козлова А.В.", {4, 3, 3, 4}),
        Student("Морозов Д.Е.", {4, 4, 5, 4})
    };

    cout << "Все студенты:" << endl;
    for (const auto& st : students) {
        st.print();
    }

    cout << "\nСтуденты, получающие стипендию:" << endl;
    bool found = false;
    for (const auto& st : students) {
        if (st.canGetStipend()) {
            st.print();
            found = true;
        }
    }
    if (!found) {
        cout << "Таких студентов нет." << endl;
    }

    return 0;
}
